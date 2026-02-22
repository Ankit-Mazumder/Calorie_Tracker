from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List
from .. import models, schemas
from ..database import get_db
from .users import get_current_user

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(
    start_date: date, 
    end_date: date, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Group by date directly in the database (much faster)
    daily_aggregates = db.query(
        models.MealEntry.date,
        func.sum(models.MealEntry.calories).label('calories'),
        func.sum(models.MealEntry.protein).label('protein'),
        func.sum(models.MealEntry.carbs).label('carbs'),
        func.sum(models.MealEntry.fat).label('fat')
    ).filter(
        models.MealEntry.user_id == current_user.id,
        models.MealEntry.date >= start_date,
        models.MealEntry.date <= end_date
    ).group_by(models.MealEntry.date).all()
    
    total_calories = 0
    total_protein = 0
    total_carbs = 0
    total_fat = 0
    
    daily_stats = {}
    for agg in daily_aggregates:
        d_str = agg.date.isoformat() if hasattr(agg.date, 'isoformat') else str(agg.date)
        c = float(agg.calories or 0)
        p = float(agg.protein or 0)
        cb = float(agg.carbs or 0)
        f = float(agg.fat or 0)
        
        daily_stats[d_str] = {
            "calories": c,
            "protein": p,
            "carbs": cb,
            "fat": f
        }
        
        total_calories += c
        total_protein += p
        total_carbs += cb
        total_fat += f
        
    return {
        "period": {"start": start_date, "end": end_date},
        "totals": {
            "calories": total_calories,
            "protein": total_protein,
            "carbs": total_carbs,
            "fat": total_fat
        },
        "daily": daily_stats
    }
