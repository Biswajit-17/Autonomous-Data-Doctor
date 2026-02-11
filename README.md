# 🩺 Auto Data Doctor

**An Autonomous AI Agent that diagnoses, cleans, and generates reports for messy datasets.**

**⚠️ Demo Note: The backend is hosted on Render's Free Tier. It spins down after inactivity. Please allow up to ~60 seconds for the first request (Diagnosis) to complete while the server wakes up.**

## 🚀 Features
- **Smart Ingestion:** Supports `.csv` and `.xlsx` files.
- **AI Diagnosis:** Uses Google Gemini to detect skewness, outliers, and missing values.
- **Auto-Cleaning:** Dynamically generates and executes Python cleaning scripts.
- **Visual Reports:** Shows "Before vs After" health metrics charts.
- **PDF Certification:** Generates a downloadable medical report for the data.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Recharts, Lucide Icons.
- **Backend:** Python (FastAPI), Pandas, NumPy.
- **AI Engine:** Google Gemini Pro (via `google-generativeai`).
- **Reporting:** FPDF.

## ⚙️ How to Run

### 1. Backend and Frontend Setup
```bash
cd backend
pip install -r requirements.txt
# Create a .env file with GOOGLE_API_KEY=your_key_here and change the model to your liking in the doctor.py file
uvicorn app:app --reload
 
cd frontend
npm install (libraries to download in the Libraries.txt file in the frontend folder)
npm run dev


How it Works
Profile: The system scans the uploaded file for statistical anomalies.
Reason: The AI Agent reviews the stats and decides a cleaning strategy (e.g., "Impute Age with Median because skew > 1").
Execute: The backend runs the generated code safely.
Report: The system generates a clean CSV and a PDF summary.
