from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import cloudinary
import cloudinary.uploader

from database import get_db
import models, schemas
from services import split_service
from auth import get_current_user

router = APIRouter(
    prefix="/videos",
    tags=["Videos"]
)

# ============================================================
# Cloudinary Configuration (yash: Fixed logic)
# ============================================================
# IMPORTANT: Dashboard se credentials utha kar Render Environment Variables mein daalein.
# Code mein os.getenv() ke andar Key ka NAAM aata hai, value nahi.
cloudinary.config(
    cloud_name=os.getenv("Root"),
    api_key=os.getenv("859614873262683"),
    api_secret=os.getenv("sQL66BggVRJLVzlw5D_-XrX3Fyg")
)

# ============================================================
# Background Split Task (Heavy FFmpeg Processing)
# ============================================================
def background_split_task(video_id: int, segments_metadata: list, db_session_factory):
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
        video = db.query(models.Video).filter(models.Video.id == video_id).first()
        if video:
            video.status = models.VideoStatus.FAILED
            db.commit()
    finally:
        db.close()

# ============================================================
# 1. Create Video (Hybrid Storage - Cloud + Local Fallback)
# ============================================================
@router.post("/", response_model=schemas.VideoResponse)
async def create_video(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    file_location = os.path.join(upload_dir, file.filename)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_video_url = None
    db_file_path = file_location 

    # 🚀 SERVER CHECK: Cloudinary upload if configured
    if os.getenv("CLOUDINARY_CLOUD_NAME"):
        try:
            upload_result = cloudinary.uploader.upload_large(
                file_location,
                resource_type="video",
                folder="syncmonster_studio"
            )
            db_video_url = upload_result.get("secure_url")
            
            # Delete local temp file to save space on Render
            if os.path.exists(file_location):
                os.remove(file_location)
        except Exception as e:
            print(f"Cloudinary Failed, using local: {e}")
            db_video_url = file_location
    else:
        db_video_url = file_location

    db_video = models.Video(
        title=title,
        description=description,
        file_path=db_file_path,
        video_url=db_video_url,
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
# NEW: Get Processed Segments (Production-Ready URL logic)
# ============================================================
@router.get("/{id}/segments")
def get_video_segments(id: int, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    segments_dir = os.path.join("uploads", "segments", str(id))
    if not os.path.exists(segments_dir):
        return []

    # yash: Dynamic Base URL detection (Local vs Production)
    # Render par 'RENDER_EXTERNAL_URL' variable automatic milta hai
    base_url = os.getenv("RENDER_EXTERNAL_URL", "http://localhost:8000")

    try:
        files = os.listdir(segments_dir)
        video_files = [f for f in files if f.endswith(('.mp4', '.mkv', '.mov'))]
        
        segments = []
        for idx, filename in enumerate(video_files):
            segments.append({
                "id": idx + 1,
                "filename": filename,
                "url": f"{base_url}/uploads/segments/{id}/{filename}"
            })
        return segments
    except Exception as e:
        print(f"Error scanning segments: {e}")
        return []

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

    db_video.status = models.VideoStatus.PROCESSING
    db.commit()

    background_tasks.add_task(
        background_split_task,
        id,
        request.segments,
        get_db
    )

    return {
        "message": "Video splitting started in the background",
        "status": "PROCESSING"
    }