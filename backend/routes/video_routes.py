from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os

from database import get_db
import models, schemas
from services import split_service
from auth import get_current_user

router = APIRouter(
    prefix="/videos",
    tags=["Videos"]
)

# ============================================================
# Background Split Task (Heavy FFmpeg Processing)
# ============================================================
def background_split_task(video_id: int, segments_metadata: list, db_session_factory):
    # Create new DB session inside background thread
    db_generator = db_session_factory()
    db = next(db_generator)

    try:
        video = db.query(models.Video).filter(models.Video.id == video_id).first()

        if not video:
            return

        # Call real FFmpeg split service
        segments = split_service.process_video_split(video, segments_metadata)

        # Update status after successful processing
        video.status = models.VideoStatus.READY
        db.commit()

    except Exception as e:
        print(f"Background Task Failed: {e}")

        # Optional: mark as FAILED
        video = db.query(models.Video).filter(models.Video.id == video_id).first()
        if video:
            video.status = models.VideoStatus.FAILED
            db.commit()

    finally:
        db.close()


# ============================================================
# 1. Create Video (PROTECTED - UploadFile Version)
# ============================================================
@router.post("/", response_model=schemas.VideoResponse)
def create_video(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    upload_dir = "uploads"

    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    file_location = f"{upload_dir}/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_video = models.Video(
        title=title,
        description=description,
        file_path=file_location,
        status=models.VideoStatus.UPLOADED
    )

    db.add(db_video)
    db.commit()
    db.refresh(db_video)

    return db_video


# ============================================================
# 2. Get All Videos (PUBLIC)
# ============================================================
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


# ============================================================
# 3. Get Video By ID (PUBLIC)
# ============================================================
@router.get("/{id}", response_model=schemas.VideoResponse)
def get_video(id: int, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == id).first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return video


# ============================================================
# 4. Update Video Metadata (PROTECTED)
# ============================================================
@router.patch("/{id}", response_model=schemas.VideoResponse)
def update_video(
    id: int,
    video_update: schemas.VideoUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
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


# ============================================================
# 5. Split Video (PROTECTED - BACKGROUND VERSION)
# ============================================================
@router.post("/{id}/split")
async def split_video(
    id: int,
    request: schemas.VideoSplitRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    db_video = db.query(models.Video).filter(models.Video.id == id).first()

    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")

    # 1️⃣ Update status immediately
    db_video.status = models.VideoStatus.PROCESSING
    db.commit()

    # 2️⃣ Run heavy FFmpeg processing in background
    background_tasks.add_task(
        background_split_task,
        id,
        request.segments,
        get_db
    )

    # 3️⃣ Return response instantly
    return {
        "message": "Video splitting started in the background",
        "status": "PROCESSING"
    }
