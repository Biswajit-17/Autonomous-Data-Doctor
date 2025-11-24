import os
import io
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

from core.profiler import DataProfiler
from core.cleaner import DataCleaner
from agents.doctor import DataDoctorAgent
from core.report_generator import generate_pdf

load_dotenv()

# --- CONFIGURATION ---
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("No GOOGLE_API_KEY found")
genai.configure(api_key=api_key)

# Setup temp folder
TEMP_FOLDER = "temp"
os.makedirs(TEMP_FOLDER, exist_ok=True)

app = FastAPI(title="Auto Data Doctor API")

# Allow Vite (Port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HELPER FUNCTION: SMART LOADER ---
def load_data(file_path: str) -> pd.DataFrame:
    """
    Intelligently loads data based on file extension.
    """
    if file_path.endswith('.csv'):
        return pd.read_csv(file_path)
    elif file_path.endswith(('.xlsx', '.xls')):
        return pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format. Please upload CSV or Excel.")

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"status": "active"}

@app.post("/analyze")
async def analyze_data(file: UploadFile = File(...)):
    """
    1. Check extension (CSV or Excel).
    2. Save file.
    3. Load using smart loader.
    4. Profile & Diagnose.
    """
    # 1. Validate Extension
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported.")

    try:
        # 2. Save the file
        file_location = f"{TEMP_FOLDER}/{file.filename}"
        with open(file_location, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 3. Read Data (Smart Load)
        try:
            df = load_data(file_location)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")
            
        # 4. Profile & Diagnose
        profiler = DataProfiler(df)
        profile_report = profiler.get_profile()
        
        doctor = DataDoctorAgent()
        diagnosis = doctor.diagnose_and_prescribe(profile_report)
        
        return {
            "filename": file.filename,
            "data_stats": profile_report,
            "ai_diagnosis": diagnosis
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis Error: {str(e)}")


@app.post("/clean")
async def clean_data(payload: dict = Body(...)):
    filename = payload.get("filename")
    code = payload.get("code")
    strategies = payload.get("strategies", [])
    ai_summary = payload.get("summary", "Cleaning completed successfully.")

    if not filename or not code:
        raise HTTPException(status_code=400, detail="Missing filename or code.")

    file_path = f"{TEMP_FOLDER}/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Original file not found.")

    try:
        # 1. Load Data (Smart Load)
        df = load_data(file_path)

        # 2. Execute Cleaning
        cleaner = DataCleaner()
        cleaned_df = cleaner.execute_cleaning_code(df, code)
        
        # 3. Save Clean File
        # We always save the CLEAN output as CSV for simplicity/interoperability
        clean_filename = f"clean_{os.path.splitext(filename)[0]}.csv"
        clean_path = f"{TEMP_FOLDER}/{clean_filename}"
        cleaned_df.to_csv(clean_path, index=False)
        
        # 4. Stats (After)
        profiler = DataProfiler(cleaned_df)
        after_stats = profiler.get_profile()
        
        # 5. Stats (Original) - Load again for comparison
        original_df = load_data(file_path)
        original_stats = DataProfiler(original_df).get_profile()

        # 6. Generate PDF
        report_filename = generate_pdf(
            filename, 
            original_stats, 
            after_stats, 
            ai_summary, 
            strategies, 
            TEMP_FOLDER
        )

        return {
            "status": "success",
            "message": "Cleaning complete",
            "download_url": f"http://127.0.0.1:8000/download/{clean_filename}",
            "report_url": f"http://127.0.0.1:8000/download/{report_filename}",
            "after_stats": after_stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleaning Failed: {str(e)}")


@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = f"{TEMP_FOLDER}/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path, 
        filename=filename, 
        media_type='application/octet-stream' # Generic binary type works for both
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)