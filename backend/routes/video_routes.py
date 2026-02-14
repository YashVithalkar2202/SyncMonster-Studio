from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

# Relative imports: '..' ka matlab ek level up (backend/ folder mein)
from ..database import get_db
from .. import models, schemas
from ..services import split_service
from ..auth import get_current_user # JWT Protection helper

router = APIRouter(
    prefix="/videos",
    tags=["Videos"]
)

# 1. Create Video (PROTECTED)
@router.post("/", response_model=schemas.VideoResponse)
def create_video(
    video: schemas.VideoCreate, 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user) # Authentication required
):
    db_video = models.Video(**video.model_dump())
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return db_video

# 2. Get All Videos (PUBLIC)
@router.get("/", response_model=List[schemas.VideoResponse])
def get_videos(
    page: int = Query(1, ge=1), 
    limit: int = Query(10, ge=1, le=100), 
    search: Optional[str] = None, 
    status: Optional[models.VideoStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Video)
    
    if search:
        query = query.filter(models.Video.title.contains(search))
    if status:
        query = query.filter(models.Video.status == status)
    
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()

# 3. Get Video By ID (PUBLIC)
@router.get("/{id}", response_model=schemas.VideoResponse)
def get_video(id: int, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

# 4. Update Video Metadata (PROTECTED)
@router.patch("/{id}", response_model=schemas.VideoResponse)
def update_video(
    id: int, 
    video_update: schemas.VideoUpdate, 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user) # Authentication required
):
    db_video = db.query(models.Video).filter(models.Video.id == id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    update_data = video_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_video, key, value)
    
    db.commit()
    db.refresh(db_video)
    return db_video

# 5. Split Video (PROTECTED)
@router.post("/{id}/split", response_model=schemas.VideoSplitResponse)
def split_video(
    id: int, 
    request: schemas.VideoSplitRequest, 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user) # Authentication required
):
    db_video = db.query(models.Video).filter(models.Video.id == id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Validation and splitting logic via service
    segments = split_service.process_video_split(db_video, request.segments)
    
    # Automatically set status to READY after successful split simulation
    db_video.status = models.VideoStatus.READY
    db.commit()
    db.refresh(db_video)
    
    return {"parent_id": id, "segments": segments}