from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

# Local imports
from database import engine, Base, get_db
from routes import video_routes
from auth import create_access_token, verify_password, FAKE_USER_DB

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SyncMonster Studio API",
    description="Advanced Video Processing Backend with JWT Auth"
)

# -------------------------------
# Create uploads directory if it doesn't exist
# -------------------------------
UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# -------------------------------
# Mount uploads folder
# -------------------------------
app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)

# -------------------------------
# CORS Configuration (Updated for Local & Server)
# -------------------------------
# Render dashboard mein jo ALLOWED_ORIGINS daalenge, ye wahan se uthayega.
# Agar variable nahi mila (Local), toh localhost:5173 use karega.
origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
    allow_credentials=True, # JWT tokens ke liye ye True hona zaroori hai
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Include Routes
# -------------------------------
app.include_router(video_routes.router)

# -------------------------------
# Health Check Endpoint
# -------------------------------
@app.get("/")
def health_check():
    return {
        "status": "online", 
        "message": "Video API is running securely",
        "version": "1.0.0"
    }

# -------------------------------
# Authentication Endpoint
# -------------------------------
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login.
    Expects 'username' and 'password' as form-data.
    """

    hashed_pass = FAKE_USER_DB.get(form_data.username)

    if not hashed_pass or not verify_password(form_data.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # JWT Token generate karein
    access_token = create_access_token(data={"sub": form_data.username})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }