from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)

    goals = relationship("Goal", back_populates="user")
    meals = relationship("MealEntry", back_populates="user")

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    daily_calories = Column(Float, nullable=True)
    daily_protein = Column(Float, nullable=True)
    daily_carbs = Column(Float, nullable=True)
    daily_fat = Column(Float, nullable=True)
    target_weight = Column(Float, nullable=True)
    
    user = relationship("User", back_populates="goals")

class MealEntry(Base):
    __tablename__ = "meal_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    meal_type = Column(String, index=True) # Breakfast, Lunch, Dinner, Snack
    food_name = Column(String, index=True)
    quantity = Column(String)
    date = Column(Date, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    calories = Column(Float)
    protein = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    fat = Column(Float, default=0.0)
    
    vitamins = Column(String, nullable=True) # Can store JSON string
    minerals = Column(String, nullable=True) # Can store JSON string

    user = relationship("User", back_populates="meals")
