from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

# Local imports
from .database import engine, Base, get_db
from .routes import video_routes
# FAKE_USER_DB ab auth.py se aayega
from .auth import create_access_token, verify_password, FAKE_USER_DB 

# -------------------------------
# Database tables create karein
# -------------------------------
Base.metadata.create_all(bind=engine)

# -------------------------------
# FastAPI App Initialize karein
# -------------------------------
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
# Files accessible at:
# http://localhost:8000/uploads/<filename>
# -------------------------------
app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)

# -------------------------------
# CORS Configuration
# React (Vite) default port 5173
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
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
