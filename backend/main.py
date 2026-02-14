from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import video_routes

# Automatically create tables in MySQL on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Video Processing API")

# Setup CORS so React (usually on port 3000/5173) can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include our routes
app.include_router(video_routes.router)

@app.get("/")
def health_check():
    return {"status": "online", "message": "Video API is running"}