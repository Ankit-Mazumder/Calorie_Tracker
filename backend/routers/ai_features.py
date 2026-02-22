import os
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from pydantic import BaseModel
import requests
import google.generativeai as genai
from PIL import Image
import io
import json
import base64
from ..core.config import settings
from .users import get_current_user
from .. import models, schemas

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

# Hugging Face Free Inference API URLs
HF_TEXT_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
HF_VISION_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-vqa-base"

# Configure Gemini if the key is present
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "dummy_key":
    genai.configure(api_key=settings.GEMINI_API_KEY)

def get_gemini_model(model_name="gemini-1.5-flash"):
    return genai.GenerativeModel(model_name)

@router.post("/extract-image")
async def extract_image(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    image_bytes = await file.read()

    # 1. Primary Method: Google Gemini (if configured)
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "dummy_key":
        try:
            image = Image.open(io.BytesIO(image_bytes))
            prompt = (
                "Analyze this image of food or a nutrition label. "
                "Return a JSON object with strictly these keys: "
                "food_name (string), calories (float), protein (float), carbs (float), fat (float)."
            )
            model = get_gemini_model()
            response = model.generate_content([prompt, image])
            
            # Extract JSON from Gemini's response
            text = response.text
            json_str = text[text.find("{"):text.rfind("}")+1]
            return json.loads(json_str)
        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Fall through to Hugging Face fallback
            pass

    # 2. Fallback Method: Free Hugging Face API
    warning_msg = "Note: Using free fallback AI. For the best accuracy and detailed scanning, please configure your GEMINI_API_KEY in the .env file."
    try:
        image_bytes = await file.read()
        
        # We ask Blip a direct question about the food to identify it
        payload = {
            "inputs": {
                "image": base64.b64encode(image_bytes).decode('utf-8'),
                "question": "What kind of food is in this image?"
            }
        }
        
        headers = {}
        # If HF API key is available in env (optional), use it to avoid rate limits
        if os.environ.get("HF_API_KEY"):
            headers["Authorization"] = f"Bearer {os.environ.get('HF_API_KEY')}"
            
        response = requests.post(HF_VISION_URL, headers=headers, json=payload, timeout=15)
        
        food_name = "Unknown Food"
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0 and 'answer' in result[0]:
                food_name = result[0]['answer'].title()
        
        # Prompt a text model to guess macros for the identified food
        text_payload = {
            "inputs": f"Estimate the nutrition facts for one serving of {food_name}. Reply ONLY with a valid JSON format exact keys: {{\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}.",
            "parameters": {"max_new_tokens": 100, "temperature": 0.1}
        }
        
        text_response = requests.post(HF_TEXT_URL, headers=headers, json=text_payload, timeout=15)
        
        macros_dict = {
            "food_name": food_name,
            "calories": 250.0,
            "protein": 10.0,
            "carbs": 30.0,
            "fat": 10.0,
            "warning": warning_msg
        } # default fallback
        
        if text_response.status_code == 200:
            tr = text_response.json()
            if isinstance(tr, list) and len(tr) > 0:
                gen_text = tr[0].get('generated_text', '')
                try:
                    # Very simple JSON extraction hack
                    json_str = gen_text[gen_text.find("{"):gen_text.rfind("}")+1]
                    parsed = json.loads(json_str)
                    if "calories" in parsed: macros_dict["calories"] = float(parsed["calories"])
                    if "protein" in parsed: macros_dict["protein"] = float(parsed["protein"])
                    if "carbs" in parsed: macros_dict["carbs"] = float(parsed["carbs"])
                    if "fat" in parsed: macros_dict["fat"] = float(parsed["fat"])
                except:
                    pass
        
        return macros_dict
        
    except Exception as e:
        print(f"HF API Error: {e}")
        # Fallback to mock data if API limits hit or failure
        return {
            "food_name": "Avocado Toast (Fallback)",
            "calories": 350.0,
            "protein": 15.0,
            "carbs": 40.0,
            "fat": 12.0,
            "warning": warning_msg
        }
        # Fallback to mock data if API limits hit or failure
        return {
            "food_name": "Avocado Toast (Fallback)",
            "calories": 350.0,
            "protein": 15.0,
            "carbs": 40.0,
            "fat": 12.0
        }

from sqlalchemy.orm import Session
from ..database import get_db
from datetime import date

@router.post("/chat")
async def chat_with_ai(
    request: ChatRequest, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    # Provide the AI with the user's current goal to ground its advice
    user_goal = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).first()
    goal_context = f"User's daily goal is {user_goal.daily_calories} calories." if user_goal else "User has not set a goal yet."
    
    # Get today's logged meals to ground its advice
    today = date.today()
    today_meals = db.query(models.MealEntry).filter(
        models.MealEntry.user_id == current_user.id,
        models.MealEntry.date == today
    ).all()
    today_cals = sum(m.calories for m in today_meals)
    
    system_prompt = f"""
    You are an intelligent nutrition assistant. Keep your responses short and friendly.
    {goal_context}
    The user has logged {today_cals} calories today.
    
    IMPORTANT: You have the ability to perform actions on behalf of the user.
    If the user asks you to log a meal, you must output a JSON block exactly like this anywhere in your response:
    __ACTION__ {{"action": "LOG_MEAL", "food_name": "name", "calories": 100, "protein": 10, "carbs": 10, "fat": 5, "meal_type": "Snack"}}
    
    If you output an __ACTION__ block, the system will automatically execute it. Make sure to also include friendly conversational text acknowledging the action.
    """
    
    reply_text = "I'm currently resting! (Free API rate limit reached.)"
    warning_prefix = ""
    
    # 1. Primary Method: Google Gemini (if configured)
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "dummy_key":
        try:
            model = get_gemini_model("gemini-1.5-flash")
            response = model.generate_content([system_prompt, "User says: " + request.message])
            reply_text = response.text.strip()
        except Exception as e:
            print(f"Gemini Chat Error: {e}")
            # Fall through to fallback
            pass

    # 2. Fallback Method: Free Hugging Face API
    else:
        warning_prefix = "⚠️ [Free AI Mode - Configure GEMINI_API_KEY in .env for better results]\n\n"
        try:
            payload = {
                "inputs": f"<|system|>\n{system_prompt}\n<|user|>\n{request.message}\n<|assistant|>\n",
                "parameters": {"max_new_tokens": 150, "temperature": 0.5}
            }
            headers = {}
            if os.environ.get("HF_API_KEY"):
                headers["Authorization"] = f"Bearer {os.environ.get('HF_API_KEY')}"
                
            response = requests.post(HF_TEXT_URL, headers=headers, json=payload, timeout=15)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    full_text = result[0].get('generated_text', '')
                    reply_text = full_text.split("<|assistant|>")[-1].strip()
        except Exception as e:
            print(f"Chat error: {e}")
            reply_text = "Sorry, I am having trouble connecting to the free AI service right now."
            
    # --- ACTION EXECUTION ENGINE ---
    # Intercept and process any __ACTION__ JSON blocks emitted by the LLM
    if "__ACTION__" in reply_text:
        try:
            # Extract everything from __ACTION__ to the next newline or end of string
            import re
            match = re.search(r'__ACTION__\s*(\{.*?\})', reply_text, re.DOTALL)
            if match:
                action_json_str = match.group(1)
                action_data = json.loads(action_json_str)
                
                # Execute LOG_MEAL action
                if action_data.get("action") == "LOG_MEAL":
                    new_meal = models.MealEntry(
                        user_id=current_user.id,
                        date=today,
                        meal_type=action_data.get("meal_type", "Snack"),
                        food_name=action_data.get("food_name", "AI Logged Food"),
                        quantity="1 serving via AI",
                        calories=float(action_data.get("calories", 0)),
                        protein=float(action_data.get("protein", 0)),
                        carbs=float(action_data.get("carbs", 0)),
                        fat=float(action_data.get("fat", 0))
                    )
                    db.add(new_meal)
                    db.commit()
                
                # Strip the hidden __ACTION__ block from the text shown to the user
                reply_text = reply_text.replace(match.group(0), "").strip()
        except Exception as e:
            print(f"Failed to execute AI action: {e}")
            
    return {"reply": warning_prefix + reply_text}
