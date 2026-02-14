from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Local imports
from .database import engine, Base, get_db
from .routes import video_routes
# FAKE_USER_DB ab auth.py se aayega
from .auth import create_access_token, verify_password, FAKE_USER_DB 

# Database tables create karein
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SyncMonster Studio API",
    description="Advanced Video Processing Backend with JWT Auth"
)

# CORS Configuration
# React (Vite) hamesha port 5173 par chalta hai
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes ko include karein
app.include_router(video_routes.router)

@app.get("/")
def health_check():
    return {
        "status": "online", 
        "message": "Video API is running securely",
        "version": "1.0.0"
    }

# --- Authentication Endpoint ---

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login.
    Expects 'username' and 'password' as form-data.
    """
    # auth.py mein jo FAKE_USER_DB hai wahan se user check karein
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