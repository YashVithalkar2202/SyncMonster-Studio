import enum
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime
from sqlalchemy.sql import func
from .database import Base

class VideoStatus(str, enum.Enum):
    DRAFT = "Draft"
    PROCESSING = "Processing"
    READY = "Ready"
    FAILED = "Failed"

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500))
    video_url = Column(String(255))
    duration = Column(Float)
    # Using Enum for strict status lifecycle
    status = Column(Enum(VideoStatus), default=VideoStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())