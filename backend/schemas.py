from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from typing import List, Optional
from .models import VideoStatus

# --- Sub-schemas for nested data ---

class Segment(BaseModel):
    start: float = Field(..., ge=0, description="Start time in seconds")
    end: float = Field(..., ge=0, description="End time in seconds")

# --- Request Schemas (What the user sends TO the API) ---

class VideoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    video_url: str 
    duration: float = Field(..., gt=0)

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[VideoStatus] = None

class VideoSplitRequest(BaseModel):
    segments: List[Segment]

# --- Response Schemas (What the API sends back TO the user) ---

class VideoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    video_url: str
    duration: float
    status: VideoStatus
    created_at: datetime

    class Config:
        # This is CRITICAL. It tells Pydantic to read data 
        # even if it's a SQL Alchemy model, not just a dictionary.
        from_attributes = True

class SplitSegmentResponse(BaseModel):
    segment_id: int
    url: str
    start: float
    end: float

class VideoSplitResponse(BaseModel):
    parent_id: int
    segments: List[SplitSegmentResponse]