import pytest
from unittest.mock import patch, MagicMock
import asyncio

from app.services.ai_service import analyze_events_with_gemini, AIAnalysis
from app.services.anomaly_service import AnomalyResult, Evidence

class DummyContext:
    def get(self, key, default):
        return default

@pytest.mark.asyncio
@patch("app.services.ai_service.genai.Client")
@patch("app.services.ai_service.supabase_service")
async def test_analyze_events_with_gemini(mock_supabase, mock_client, monkeypatch):
    mock_supabase.check_ai_analysis_exists.return_value = False
    mock_supabase.store_ai_analysis.return_value = True
    monkeypatch.setenv("GEMINI_API_KEY", "test_key")
    
    # Mock GenAI client
    mock_instance = MagicMock()
    mock_client.return_value = mock_instance
    mock_response = MagicMock()
    mock_response.text = '{"event_id": "test-id", "diagnosis": "Drought", "evidence": [], "risk_explanation": "High", "recommendations": [], "confidence": 95, "uncertainty": "", "language": "English"}'
    mock_instance.models.generate_content.return_value = mock_response

    anomaly = AnomalyResult(device_id="DEV-01", timestamp=None, risk_level="HIGH")
    anomaly.event_ids = ["test-event-1"]
    anomaly.evidence = [Evidence(code="TEST_CODE", message="Test message")]
    
    context = DummyContext()
    
    # Call AI service
    await analyze_events_with_gemini(anomaly, context, "English")
    
    # Ensure Gemini was called
    mock_instance.models.generate_content.assert_called_once()
    
    # Ensure it was stored
    mock_supabase.store_ai_analysis.assert_called_once()
    args, kwargs = mock_supabase.store_ai_analysis.call_args
    assert args[0] == "test-event-1"
    assert args[1]["diagnosis"] == "Drought"

@pytest.mark.asyncio
@patch("app.services.ai_service.genai.Client")
async def test_ai_service_does_not_crash_on_failure(mock_client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test_key")
    mock_client.side_effect = Exception("Simulated Gemini Failure")
    
    anomaly = AnomalyResult(device_id="DEV-01", timestamp=None, risk_level="HIGH")
    anomaly.event_ids = ["test-event-2"]
    
    # This should not raise an exception
    await analyze_events_with_gemini(anomaly, {}, "English")
