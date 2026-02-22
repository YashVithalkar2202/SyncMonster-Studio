import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import io
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import Base, get_db
from auth import get_current_user 

# --- Test DB Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_db.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 1. Database Dependency Override
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# 2. Authentication Bypass 
def override_get_current_user():
    return "test_admin"

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    # Fresh start for every test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    yield
    Base.metadata.drop_all(bind=engine)

# --- Updated Test Cases ---

def test_create_video_with_real_file():
    file = io.BytesIO(b"fake video content")
    
    # Authenticated request 
    response = client.post(
        "/videos/",
        data={"title": "Test Video", "description": "High-speed test"},
        files={"file": ("test_video.mp4", file, "video/mp4")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Video"
    assert data["status"] == "Uploaded" 

def test_get_video_segments_empty():
    # Step 1: Upload a video first to ensure ID 1 exists
    file = io.BytesIO(b"content")
    client.post("/videos/", data={"title": "Segment Test"}, files={"file": ("v.mp4", file, "video/mp4")})
    
    # Step 2: Check segments
    response = client.get("/videos/1/segments")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_video_split_trigger():
    # Step 1: Upload video
    file = io.BytesIO(b"content")
    client.post("/videos/", data={"title": "Split Test"}, files={"file": ("split.mp4", file, "video/mp4")})
    
    # Step 2: Trigger split (Needs Auth bypass)
    response = client.post("/videos/1/split", json={
        "segments": [{"start": 0, "end": 5}]
    })
    
    assert response.status_code == 200
    assert response.json()["status"] == "PROCESSING"

def test_get_video_404():
    # Non-existent ID should still return 404
    response = client.get("/videos/999")
    assert response.status_code == 404