from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime, timedelta
import uvicorn
import hashlib
from typing import Optional

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
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            units REAL,
            predicted_bill REAL,
            timestamp TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS guest_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            count INTEGER DEFAULT 0
        )
    ''')
    
    # Migration: Add user_id column if it doesn't exist
    try:
        cursor.execute("PRAGMA table_info(history)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'user_id' not in columns:
            cursor.execute("ALTER TABLE history ADD COLUMN user_id INTEGER")
    except Exception as e:
        print(f"Migration note: {e}")
    
    conn.commit()
    conn.close()

init_db()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

# 3. Data Models
class PredictionRequest(BaseModel):
    units: float
    user_id: Optional[int] = None

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    created_at: str

# 4. API Routes

# Authentication Endpoints
@app.post("/api/register")
async def register(request: RegisterRequest):
    try:
        conn = sqlite3.connect("bills.db")
        cursor = conn.cursor()
        password_hash = hash_password(request.password)
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)",
            (request.username, request.email, password_hash, request.full_name, datetime.now().isoformat())
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return {
            "id": user_id,
            "username": request.username,
            "email": request.email,
            "full_name": request.full_name,
            "message": "User registered successfully"
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login")
async def login(request: LoginRequest):
    try:
        conn = sqlite3.connect("bills.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (request.username,))
        user = cursor.fetchone()
        conn.close()
        
        if not user or not verify_password(request.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        return {
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "full_name": user['full_name'],
            "created_at": user['created_at']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/{user_id}")
async def get_user(user_id: int):
    try:
        conn = sqlite3.connect("bills.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, full_name, created_at FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return dict(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# History Endpoints
@app.get("/api/history")
async def get_history(user_id: Optional[int] = None):
    try:
        conn = sqlite3.connect("bills.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if user_id:
            cursor.execute("SELECT id, units, predicted_bill, timestamp FROM history WHERE user_id = ? ORDER BY id DESC", (user_id,))
        else:
            cursor.execute("SELECT id, units, predicted_bill, timestamp FROM history WHERE user_id IS NULL ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/clear")
async def clear_history(user_id: Optional[int] = None):
    try:
        conn = sqlite3.connect("bills.db")
        cursor = conn.cursor()
        if user_id:
            cursor.execute("DELETE FROM history WHERE user_id = ?", (user_id,))
        else:
            cursor.execute("DELETE FROM history WHERE user_id IS NULL")
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
            "INSERT INTO history (user_id, units, predicted_bill, timestamp) VALUES (?, ?, ?, ?)",
            (request.user_id, request.units, prediction, timestamp)
        )
        conn.commit()
        conn.close()
        return {"predicted_bill": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database Error")

@app.get("/api/guest-predictions-today")
async def get_guest_predictions_today():
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        conn = sqlite3.connect("bills.db")
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM history WHERE user_id IS NULL AND DATE(timestamp) = ?", (today,))
        result = cursor.fetchone()
        conn.close()
        return {"count": result[0] if result else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Run Server
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)