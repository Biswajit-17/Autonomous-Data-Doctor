import os
import json
import re
from groq import Groq

class DataDoctorAgent:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("Warning: GROQ_API_KEY not found in environment")
        
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile" 

    def diagnose_and_prescribe(self, data_profile):
        """
        Uses Groq (Llama 3) to analyze stats and write code.
        """
        # Create condensed profile to save tokens
        condensed_profile = {}
        for col, stats in data_profile.get("column_details", {}).items():
            condensed_profile[col] = {
                "type": stats.get("type"),
                "missing": stats.get("missing_percentage"),
                "skew": stats.get("skewness", 0),
                "is_numeric": stats.get("is_numeric")
            }

        prompt = f"""
        You are an expert Data Scientist. Analyze this dataset profile and generate Python cleaning code.

        DATA PROFILE:
        {json.dumps(condensed_profile, indent=2)}

        INSTRUCTIONS:
        1. Identify issues (High missing %, Skewness > 1, Outliers).
        2. Decide actions (Drop if missing > 50%, Impute Median if skewed, Mean if normal).
        3. Write a Python function `clean_data(df)` using pandas/numpy.

        RESPONSE FORMAT:
        You must output ONLY valid JSON.
        {{
            "diagnosis_summary": "One sentence summary of issues.",
            "strategies_defined": [
                {{"column": "ColName", "issue": "Skewed", "action": "Median Imputation"}}
            ],
            "generated_python_code": "import pandas as pd\\n..."
        }}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a JSON-only API. Do not output Markdown blocks. Output raw JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt, 
                    }
                ],
                model=self.model,
                temperature=0.1, 
                response_format={"type": "json_object"} 
            )

            text_response = chat_completion.choices[0].message.content
            
            
            return json.loads(text_response)

        except Exception as e:
            print(f"Error: {str(e)}")
            return {
                "diagnosis_summary": f"Error generating diagnosis: {str(e)}",
                "strategies_defined": [],
                "generated_python_code": ""
            }