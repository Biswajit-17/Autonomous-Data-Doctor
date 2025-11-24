import google.generativeai as genai
import json
import os

class DataDoctorAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-pro')

    def diagnose_and_prescribe(self, data_profile):
        """
        Analyzes statistics and writes Python code.
        """
        # Create a condensed profile to save token space
        # We only send column names, types, and missing/skew stats
        # This fixes issues where the prompt gets too big for the free tier
        condensed_profile = {}
        for col, stats in data_profile.get("column_details", {}).items():
            condensed_profile[col] = {
                "type": stats.get("type"),
                "missing": stats.get("missing_percentage"),
                "skew": stats.get("skewness", 0),
                "is_numeric": stats.get("is_numeric")
            }

        prompt = f"""
        You are the Auto Data Doctor. Analyze this dataset profile and output a python cleaning script.
        
        DATA PROFILE:
        {json.dumps(condensed_profile, indent=2)}

        RULES:
        1. If missing > 50%, drop column.
        2. If numeric & skewed (>1), impute median.
        3. If numeric & normal, impute mean.
        4. If categorical, impute mode.
        5. Cap outliers using IQR.

        RESPONSE FORMAT (Strict JSON):
        {{
            "diagnosis_summary": "Brief text summary of issues.",
            "strategies_defined": [
                {{"column": "ColName", "issue": "Missing", "action": "Drop"}}
            ],
            "generated_python_code": "import pandas as pd\\nimport numpy as np\\ndef clean_data(df):\\n    # Write code here\\n    return df"
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            text_response = response.text
            
            # Debug: Print raw AI response to terminal
            print("\n--- 🤖 AI RAW RESPONSE ---")
            print(text_response)
            print("--------------------------\n")
            
            clean_text = text_response.replace("```json", "").replace("```", "").strip()
            diagnosis = json.loads(clean_text)
            return diagnosis

        except Exception as e:
            # Debug: Print the specific error
            print(f"\n❌ AI AGENT ERROR: {str(e)}\n")
            
            return {
                "diagnosis_summary": "Failed to generate diagnosis.",
                "generated_python_code": "",
                "strategies_defined": []
            }