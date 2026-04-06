import json
import sqlite3
import os

# Paths
DB_PATH = "/Users/chiragkeswani/Documents/Envision/backend/interview_results.db"

def update_demo_report():
    if not os.path.exists(DB_PATH):
        print("Database not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # New portfolio data
    soft_skills = {
        "confidence": 85.5,
        "clarity": 78.2,
        "engagement": 92.0
    }
    summary = "The candidate presents as highly authentic and composed. They demonstrate exceptional confidence and emotional stability. Communication is remarkably clear, articulate, and well-structured. Highly engaging presence with positive facial affect and sentiment."
    
    # Get existing record
    cursor.execute("SELECT detailed_analysis FROM analysis_results WHERE id = 1")
    row = cursor.fetchone()
    
    if row:
        detailed = json.loads(row[0])
        detailed["soft_skills"] = soft_skills
        detailed["recruiter_summary"] = summary
        
        cursor.execute(
            "UPDATE analysis_results SET detailed_analysis = ?, truth_score = 82.5, confidence_score = 88.0 WHERE id = 1",
            (json.dumps(detailed),)
        )
        conn.commit()
        print("Update successful: Report #1 now has portfolio data.")
    else:
        print("Report #1 not found in database.")

    conn.close()

if __name__ == "__main__":
    update_demo_report()
