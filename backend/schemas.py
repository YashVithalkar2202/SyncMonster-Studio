from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from models import VideoStatus

# --- Sub-schemas for nested data ---

class Segment(BaseModel):
    start: float = Field(..., ge=0, description="Start time in seconds")
    end: float = Field(..., ge=0, description="End time in seconds")

# --- Request Schemas ---

class VideoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[VideoStatus] = None

class VideoSplitRequest(BaseModel):
    segments: List[Segment]

# --- Response Schemas ---

class VideoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None 
    duration: Optional[float] = None
    file_path: Optional[str] = None 
    created_at: datetime

    class Config:
        from_attributes = True

class SplitSegmentResponse(BaseModel):
    id: int 
    url: str
    start: float
    end: float

class VideoSplitResponse(BaseModel):
    parent_id: int
    segments: List[dict] 