import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine, Base
from backend.models import User
from backend.core.security import get_password_hash

def create_guest_user():
    db = SessionLocal()
    try:
        # Check if guest exists
        guest = db.query(User).filter(User.username == "guest").first()
        if not guest:
            print("Creating guest user...")
            hashed_password = get_password_hash("guestpassXYZ123")
            # In models.py, fields are lowercase
            new_guest = User(
                username="guest",
                name="Guest User",
                age=30,
                height=170.0,
                weight=70.0,
                hashed_password=hashed_password
            )
            db.add(new_guest)
            db.commit()
            print("Guest user created.")
        else:
            print("Guest user already exists.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_guest_user()
