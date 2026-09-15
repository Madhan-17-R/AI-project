import os
import json
from google import genai
from pydantic import BaseModel
from app.utils.logger import get_logger
from app.services import supabase_service

logger = get_logger("ai_service")

class AIAnalysis(BaseModel):
    event_id: str
    diagnosis: str
    evidence: list[str]
    risk_explanation: str
    recommendations: list[str]
    confidence: int
    uncertainty: str
    language: str

async def analyze_events_with_gemini(anomaly_result, context: dict, language: str = "English"):
    """
    Invokes Gemini to analyze the created anomaly events.
    Runs asynchronously. Completely isolated from the critical ingestion path.
    """
    if not anomaly_result.event_ids:
        logger.info("No event_ids provided to AI service. Skipping analysis.")
        return

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not set. Skipping AI analysis.")
        return

    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        return

    for event_id in anomaly_result.event_ids:
        if supabase_service.check_ai_analysis_exists(event_id):
            logger.info(f"AI Analysis already exists for event_id: {event_id}. Skipping.")
            continue

        try:
            # Build prompt context
            prompt = _build_analysis_prompt(event_id, anomaly_result, context, language)
            
            logger.info(f"Invoking Gemini ({model_name}) for event_id: {event_id} in {language}")
            
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIAnalysis,
                ),
            )
            
            result_data = json.loads(response.text)
            
            # Persist to database
            db_payload = {
                "event_id": event_id,
                "model": model_name,
                "diagnosis": result_data.get("diagnosis", "Unknown"),
                "evidence": result_data.get("evidence", []),
                "risk_explanation": result_data.get("risk_explanation", "Unknown"),
                "recommendations": result_data.get("recommendations", []),
                "confidence": result_data.get("confidence", 0),
                "uncertainty": result_data.get("uncertainty", ""),
                "language": result_data.get("language", language)
            }
            
            supabase_service.store_ai_analysis(event_id, db_payload)
            
        except Exception as e:
            logger.error(f"Gemini AI analysis failed for event {event_id}: {e}")
            # Ensure failure is isolated; do not re-raise!

def _build_analysis_prompt(event_id: str, anomaly_result, context: dict, language: str) -> str:
    # Extract evidence specific to this event or just use the first matching one
    # We will pass the full AnomalyResult context to give Gemini maximum data
    evidence_text = "\n".join([f"- {ev.code}: {ev.message}" for ev in anomaly_result.evidence])
    
    return f"""
    You are an expert agricultural AI assistant. An anomaly event has been detected on a farm.
    Analyze the event based on the following sensor data and agricultural context.
    
    EVENT DETAILS:
    - Event ID: {event_id}
    - Device ID: {anomaly_result.device_id}
    - Risk Level: {anomaly_result.risk_level}
    - Field Status: {anomaly_result.field_status}
    - Sensor Evidence:
    {evidence_text}
    
    AGRICULTURAL CONTEXT:
    - State: {context.get('state', 'Unknown')}
    - District: {context.get('district', 'Unknown')}
    - Crop: {context.get('crop', 'Unknown')}
    - Growth Stage: {context.get('growth_stage', 'Unknown')}
    - Soil Type: {context.get('soil_type', 'Unknown')}
    - Irrigation Method: {context.get('irrigation_method', 'Unknown')}
    - Irrigation Source: {context.get('irrigation_source', 'Unknown')}
    - Water Availability: {context.get('water_availability_class', 'Unknown')}
    - Climate Zone: {context.get('climate_zone', 'Unknown')}
    
    INSTRUCTIONS:
    1. Interpret the anomaly and explain the probable cause.
    2. Summarize the supporting evidence.
    3. Explain the severity/risk in practical terms.
    4. Provide actionable agricultural recommendations for the farmer.
    5. State your confidence level (0-100) and any uncertainty (e.g., missing weather data).
    6. YOU MUST RESPOND IN THIS LANGUAGE: {language}.
    7. Return the output as valid JSON matching the schema.
    """
