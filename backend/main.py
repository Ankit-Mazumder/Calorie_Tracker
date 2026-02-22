from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base

from .routers import meals, goals, ai_features, reports, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Calorie Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])
app.include_router(meals.router, prefix="/api/meals", tags=["meals"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(ai_features.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Personal Calorie Tracker API"}
