from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date, datetime
import fitz # PyMuPDF
import re
from .. import models, schemas
from ..database import get_db
from .users import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.MealEntryResponse)
def create_meal(meal: schemas.MealEntryCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_meal = models.MealEntry(**meal.model_dump(), user_id=current_user.id)
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        
        imported_count = 0
        
        # Extremely basic parser - assumes format is roughly: 
        # YYYY-MM-DD | MealType | Food Name | Calories | Protein | Carbs | Fat
        for page in doc:
            text = page.get_text()
            lines = text.split('\n')
            
            for line in lines:
                # Look for a date signature as the start of a valid row
                match = re.search(r'(\d{4}-\d{2}-\d{2})\s+\|\s+([A-Za-z]+)\s+\|\s+(.*?)\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)', line)
                if match:
                    date_str, meal_type, food_name, cals, protein, carbs, fat = match.groups()
                    
                    db_meal = models.MealEntry(
                        user_id=current_user.id,
                        date=datetime.strptime(date_str, "%Y-%m-%d").date(),
                        meal_type=meal_type.strip(),
                        food_name=food_name.strip(),
                        quantity="1 serving from PDF",
                        calories=float(cals),
                        protein=float(protein),
                        carbs=float(carbs),
                        fat=float(fat)
                    )
                    db.add(db_meal)
                    imported_count += 1
                    
        if imported_count > 0:
            db.commit()
            
        return {"ok": True, "message": f"Successfully imported {imported_count} meals from PDF"}
    except Exception as e:
        print(f"PDF Parse error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse PDF document. Ensure it matches the expected tabular format: YYYY-MM-DD | MealType | Food Name | Calories | Protein | Carbs | Fat")

@router.get("/", response_model=schemas.PaginatedMealsResponse)
def get_meals(
    skip: int = 0, 
    limit: int = 50, 
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    meal_type: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.MealEntry).filter(models.MealEntry.user_id == current_user.id)
    
    if start_date:
        query = query.filter(models.MealEntry.date >= start_date)
    if end_date:
        query = query.filter(models.MealEntry.date <= end_date)
    if meal_type:
        query = query.filter(models.MealEntry.meal_type == meal_type)
        
    total = query.count()
    items = query.order_by(models.MealEntry.date.desc(), models.MealEntry.timestamp.desc()).offset(skip).limit(limit).all()
    
    return schemas.PaginatedMealsResponse(total=total, page=(skip // limit) + 1, size=limit, items=items)

@router.delete("/{meal_id}")
def delete_meal(meal_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_meal = db.query(models.MealEntry).filter(models.MealEntry.id == meal_id, models.MealEntry.user_id == current_user.id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(db_meal)
    db.commit()
    return {"ok": True}
