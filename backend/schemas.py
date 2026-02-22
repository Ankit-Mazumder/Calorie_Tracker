from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    daily_calories: Optional[float] = None
    daily_protein: Optional[float] = None
    daily_carbs: Optional[float] = None
    daily_fat: Optional[float] = None
    target_weight: Optional[float] = None

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class MealEntryBase(BaseModel):
    meal_type: str
    food_name: str
    quantity: str
    date: date
    calories: float
    protein: float = 0.0
    carbs: float = 0.0
    fat: float = 0.0
    vitamins: Optional[str] = None
    minerals: Optional[str] = None

class MealEntryCreate(MealEntryBase):
    pass

class MealEntryResponse(MealEntryBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Pagination schemas
class PaginatedMealsResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[MealEntryResponse]
