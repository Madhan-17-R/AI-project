import os
import json
import re
import subprocess
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

LANGUAGES = [
    ("hindi", "Hindi"),
    ("bengali", "Bengali"),
    ("telugu", "Telugu"),
    ("marathi", "Marathi"),
    ("tamil", "Tamil"),
    ("gujarati", "Gujarati"),
    ("urdu", "Urdu"),
    ("kannada", "Kannada"),
    ("odia", "Odia"),
    ("malayalam", "Malayalam"),
    ("punjabi", "Punjabi"),
    ("assamese", "Assamese"),
    ("maithili", "Maithili"),
    ("sanskrit", "Sanskrit"),
    ("konkani", "Konkani"),
    ("manipuri", "Manipuri"),
    ("kashmiri", "Kashmiri"),
    ("nepali", "Nepali"),
    ("sindhi", "Sindhi"),
    ("dogri", "Dogri"),
    ("santali", "Santali")
]

PROMPT_TEMPLATE = """
You are an expert localization engineer and translator.
Translate the following English JSON dictionary into {language}.

Rules:
1. ONLY translate the JSON string VALUES. Do NOT translate the JSON string keys.
2. The brand name "MARUDAM" MUST remain "MARUDAM" (in English characters).
3. Preserve any dynamic variables wrapped in curly braces exactly as they are (e.g., {name}, {crop}). Do NOT translate the variable name inside the braces.
4. Use proper native script for {language}. Do not use pseudo-translations, transliterations or Latin script unless the language normally uses Latin script.
5. Use natural, agriculture-appropriate terminology for a farming app.
6. The output MUST be a single raw JSON object matching the exact structure of the input. Do not include markdown code block backticks (like ```json). Just the raw JSON.

English Source JSON:
{source_json}
"""

def extract_en_json():
    # Run a node script to extract en.ts to JSON
    node_script = """
    const fs = require('fs');
    
    // Read the file and strip the import/export stuff
    let content = fs.readFileSync('../../src/lib/i18n/locales/en.ts', 'utf-8');
    content = content.replace(/import.*?;/g, '');
    content = content.replace(/export const en: Translations = /g, 'const en = ');
    
    // Safely evaluate the object
    const evalCode = content + '\\nmodule.exports = en;';
    const enObj = eval(evalCode);
    console.log(JSON.stringify(enObj));
    """
    with open("temp_extract.js", "w") as f:
        f.write(node_script)
    
    result = subprocess.run(["node", "temp_extract.js"], capture_output=True, text=True)
    os.remove("temp_extract.js")
    
    if result.returncode != 0:
        print("Error extracting JSON:", result.stderr)
        return None
        
    return json.loads(result.stdout)

def main():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set.")
        return
        
    client = genai.Client(api_key=api_key)
    
    print("Extracting English source JSON...")
    en_json = extract_en_json()
    if not en_json:
        return
        
    en_json_str = json.dumps(en_json, indent=2)
    
    out_dir = "../../src/lib/i18n/locales"
    
    for filename, lang_name in LANGUAGES:
        out_file = os.path.join(out_dir, f"{filename}.ts")
        if os.path.exists(out_file):
            print(f"Skipping {lang_name}, file already exists.")
            continue
            
        print(f"Translating to {lang_name}...")
        prompt = PROMPT_TEMPLATE.replace("{language}", lang_name).replace("{source_json}", en_json_str)
        
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
            )
            
            # Clean up response if it has markdown ticks
            output_text = response.text.strip()
            if output_text.startswith("```json"):
                output_text = output_text[7:]
            if output_text.startswith("```"):
                output_text = output_text[3:]
            if output_text.endswith("```"):
                output_text = output_text[:-3]
                
            output_text = output_text.strip()
            
            # Verify it's valid JSON
            translated_json = json.loads(output_text)
            
            # Write to .ts file
            ts_content = f'import {{ Translations }} from "../translations";\n\nexport const {filename}: Translations = {json.dumps(translated_json, indent=2, ensure_ascii=False)};\n'
            
            with open(out_file, 'w', encoding='utf-8') as f:
                f.write(ts_content)
                
            print(f"Successfully generated {filename}.ts")
            time.sleep(2) # rate limit protection
            
        except Exception as e:
            print(f"Error translating {lang_name}: {e}")

if __name__ == "__main__":
    main()
