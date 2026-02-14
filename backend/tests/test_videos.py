import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..main import app
from ..database import Base, get_db

# We use a local SQLite DB just for testing to keep it fast and isolated
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_db.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# --- Test Cases ---

def test_create_video():
    response = client.post("/videos/", json={
        "title": "Test Video",
        "description": "A test description",
        "video_url": "http://example.com/video.mp4",
        "duration": 120.5
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Video"
    assert data["status"] == "Draft"

def test_get_video_by_id():
    # First, create one
    client.post("/videos/", json={"title": "Find Me", "description": "D", "video_url": "U", "duration": 10})
    # Then, fetch it
    response = client.get("/videos/1")
    assert response.status_code == 200
    assert response.json()["title"] == "Find Me"

def test_video_split_success():
    # Create video
    client.post("/videos/", json={"title": "Split Video", "description": "D", "video_url": "U", "duration": 100})
    
    # Attempt split
    response = client.post("/videos/1/split", json={
        "segments": [
            {"start": 0, "end": 10},
            {"start": 10, "end": 20}
        ]
    })
    assert response.status_code == 200
    assert len(response.json()["segments"]) == 2
    assert response.json()["segments"][0]["url"].endswith("_segment_1.mp4")

def test_video_split_invalid_duration():
    client.post("/videos/", json={"title": "Short Video", "description": "D", "video_url": "U", "duration": 10})
    
    # Try to split at 20s when video is only 10s
    response = client.post("/videos/1/split", json={
        "segments": [{"start": 0, "end": 20}]
    })
    assert response.status_code == 400
    assert "exceeds video duration" in response.json()["detail"]