from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    age: int

class Progress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    age_group: str
    operation: str
    level: str
    score: int
    stars: int
    completed_exercises: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProgressCreate(BaseModel):
    user_id: str
    age_group: str
    operation: str
    level: str
    score: int
    stars: int
    completed_exercises: int

class Exercise(BaseModel):
    number1: int
    number2: int
    operation: str
    correct_answer: int
    options: List[int]


# Helper functions
def generate_exercise(age_group: str, operation: str, level: str) -> dict:
    """Generate a math exercise based on age group, operation, and level"""
    
    # Define ranges based on age group and level
    ranges = {
        "3-5": {
            "facil": (1, 5),
            "intermedio": (1, 10),
            "dificil": (1, 15)
        },
        "7-9": {
            "facil": (1, 20),
            "intermedio": (1, 50),
            "dificil": (1, 100)
        },
        "10-12": {
            "facil": (1, 50),
            "intermedio": (1, 100),
            "dificil": (1, 200)
        }
    }
    
    min_val, max_val = ranges[age_group][level]
    
    if operation == "suma":
        num1 = random.randint(min_val, max_val)
        num2 = random.randint(min_val, max_val)
        answer = num1 + num2
    elif operation == "resta":
        num1 = random.randint(min_val, max_val)
        num2 = random.randint(min_val, num1)  # Ensure positive result
        answer = num1 - num2
    elif operation == "multiplicacion":
        if level == "facil":
            num1 = random.randint(1, 5)
            num2 = random.randint(1, 5)
        elif level == "intermedio":
            num1 = random.randint(1, 10)
            num2 = random.randint(1, 10)
        else:
            num1 = random.randint(1, 12)
            num2 = random.randint(1, 12)
        answer = num1 * num2
    elif operation == "division":
        if level == "facil":
            num2 = random.randint(2, 5)
            answer = random.randint(1, 10)
        elif level == "intermedio":
            num2 = random.randint(2, 10)
            answer = random.randint(1, 20)
        else:
            num2 = random.randint(2, 12)
            answer = random.randint(1, 50)
        num1 = num2 * answer  # Ensure exact division
    else:
        num1 = num2 = answer = 0
    
    # Generate wrong options
    options = [answer]
    while len(options) < 4:
        if operation == "division" and answer < 10:
            wrong = random.randint(max(1, answer - 5), answer + 5)
        else:
            offset = random.randint(1, max(5, answer // 2))
            wrong = answer + random.choice([-offset, offset])
        if wrong > 0 and wrong not in options:
            options.append(wrong)
    
    random.shuffle(options)
    
    return {
        "number1": num1,
        "number2": num2,
        "operation": operation,
        "correct_answer": answer,
        "options": options
    }


# Routes
@api_router.get("/")
async def root():
    return {"message": "Matemáticas LEGO API"}

@api_router.post("/users", response_model=User)
async def create_user(input: UserCreate):
    # Validate age range
    if input.age < 3 or input.age > 12:
        raise HTTPException(status_code=400, detail="La edad debe estar entre 3 y 12 años")
    
    # Check if user exists
    existing_user = await db.users.find_one({"name": input.name, "age": input.age}, {"_id": 0})
    if existing_user:
        if isinstance(existing_user.get('created_at'), str):
            existing_user['created_at'] = datetime.fromisoformat(existing_user['created_at'])
        return User(**existing_user)
    
    # Create new user
    user_dict = input.model_dump()
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

@api_router.get("/users/{user_id}/progress", response_model=List[Progress])
async def get_user_progress(user_id: str):
    progress_list = await db.progress.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    for progress in progress_list:
        if isinstance(progress.get('timestamp'), str):
            progress['timestamp'] = datetime.fromisoformat(progress['timestamp'])
    
    return progress_list

@api_router.post("/progress", response_model=Progress)
async def save_progress(input: ProgressCreate):
    progress_dict = input.model_dump()
    progress_obj = Progress(**progress_dict)
    
    doc = progress_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.progress.insert_one(doc)
    return progress_obj

@api_router.get("/exercises")
async def get_exercises(
    age_group: str,
    operation: str,
    level: str,
    count: int = 10
):
    exercises = []
    for _ in range(count):
        exercise = generate_exercise(age_group, operation, level)
        exercises.append(exercise)
    
    return {"exercises": exercises}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()