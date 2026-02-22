from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import random
from datetime import datetime, timedelta

def create_sample_pdf(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Nutrition Diary Export")
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, height - 80, "Date       | MealType  | Food Name               | Calories | Protein | Carbs | Fat")
    c.line(50, height - 85, width - 50, height - 85)
    
    c.setFont("Helvetica", 10)
    
    y = height - 105
    today = datetime.now()
    
    meals = [
        ("Breakfast", "Oatmeal with Berries", 350, 10, 60, 5),
        ("Lunch", "Grilled Chicken Salad", 450, 40, 20, 15),
        ("Dinner", "Salmon and Quinoa", 550, 35, 45, 20),
        ("Snack", "Apple and Almonds", 200, 5, 25, 10)
    ]
    
    # Generate 3 days of logs
    for day_offset in range(3):
        date_str = (today - timedelta(days=day_offset)).strftime("%Y-%m-%d")
        
        for m_type, f_name, cals, p, carbs, f in meals:
            # Add some slight randomness
            actual_cals = cals + random.randint(-20, 20)
            
            line_str = f"{date_str} | {m_type:<9} | {f_name:<23} | {actual_cals:<8} | {p:<7} | {carbs:<5} | {f}"
            c.drawString(50, y, line_str)
            y -= 20
            
            if y < 50:
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 10)

    c.save()
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    create_sample_pdf("sample_diary.pdf")
