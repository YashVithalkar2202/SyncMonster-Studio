import enum
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime
from sqlalchemy.sql import func
from database import Base

class VideoStatus(str, enum.Enum):
    DRAFT = "Draft"
    UPLOADED = "Uploaded" # Add this line
    PROCESSING = "Processing"
    READY = "Ready"
    FAILED = "Failed"
    
class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500))
    file_path = Column(String(500)) # Add this for real video storage
    video_url = Column(String(255), nullable=True) # Keep or remove
    duration = Column(Float, nullable=True)
    status = Column(Enum(VideoStatus), default=VideoStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())