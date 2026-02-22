# AI Calorie & Nutrition Tracker

A modern, full-stack web application for tracking personal health goals and nutrition, powered by AI.

## Features Built
1. **Multi-User Dashboards:** Private data isolation across goals, meals, and reports.
2. **AI Meal Scanner:** Upload a photo of food to magically extract nutritional estimates and macros (Google Gemini or free open HuggingFace fallback).
3. **Conversational Agent:** Chat with a nutritionist AI that can automatically log meals for you straight to your database. (e.g., "I just ate a 500 calorie burger, log it!").
4. **Interactive Dashboard:** Dynamic charts rendering real-time macros and 7-day calorie trajectories. 
5. **Bulk PDF Imports:** Upload an exported PDF tabular diary to batch-insert daily logs.
6. **Config-Driven Architecture:** Managed entirely by a single `config.json` that bridges the backend API, frontend endpoints, and port allocations.

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Chart.js, Axios
- **Backend:** FastAPI, Python, SQLAlchemy, PyMuPDF, `google-generativeai`
- **Database:** SQLite (Default, defined in `config.json`)

## Configuration
Edit `config.json` in the root directory:
```json
{
    "database_url": "sqlite:///./calorie_tracker.db",
    "frontend_api_base_url": "http://localhost:8000/api",
    "backend_host": "0.0.0.0",
    "backend_port": 8000
}
```

## Running the Application

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*(Optionally populate the `.env` file with `GEMINI_API_KEY=xxx` for accurate AI scanning)*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Test Bulk Imports
We've included a script to generate a sample PDF test file!
```bash
pip install reportlab
python generate_sample_pdf.py
```
This produces `sample_diary.pdf`. Upload this using the "Import Diary (PDF)" button on the "History" tab of the running web application.
