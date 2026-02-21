from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime
import uvicorn

app = FastAPI()

# 1. CORS Configuration
# This allows your Next.js app (on port 3000) to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Database Setup
def init_db():
    conn = sqlite3.connect("bills.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            units REAL,
            predicted_bill REAL,
            timestamp TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# 3. Data Models
class PredictionRequest(BaseModel):
    units: float

# 4. API Routes
@app.get("/api/history")
async def get_history():
    try:
        conn = sqlite3.connect("bills.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, units, predicted_bill, timestamp FROM history ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/clear")
async def clear_history():
    try:
        conn = sqlite3.connect("bills.db")
        cursor = conn.cursor()
        cursor.execute("DELETE FROM history")
        conn.commit()
        conn.close()
        return {"message": "History cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/{item_id}")
async def delete_history_item(item_id: int):
    try:
        conn = sqlite3.connect("bills.db")
        cursor = conn.cursor()
        cursor.execute("DELETE FROM history WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        return {"message": "Item deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
async def predict_bill(request: PredictionRequest):
    # Logic: $0.12 per unit + $10 base fee (Replace with your ML model logic)
    prediction = (request.units * 0.12) + 10.0
    timestamp = datetime.now().isoformat()

    try:
        conn = sqlite3.connect("bills.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO history (units, predicted_bill, timestamp) VALUES (?, ?, ?)",
            (request.units, prediction, timestamp)
        )
        conn.commit()
        conn.close()
        return {"predicted_bill": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database Error")

# 5. Run Server
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)