from fastapi import HTTPException
from ..models import Video

def process_video_split(video: Video, segments: list):
    """
    Validates segments against video duration and simulates splitting logic.
    """
    validated_segments = []
    
    for i, seg in enumerate(segments):
        # 1. Validation Logic
        if seg.start < 0:
            raise HTTPException(status_code=400, detail=f"Segment {i} start time cannot be negative")
        if seg.end > video.duration:
            raise HTTPException(status_code=400, detail=f"Segment {i} end time ({seg.end}s) exceeds video duration ({video.duration}s)")
        if seg.start >= seg.end:
            raise HTTPException(status_code=400, detail=f"Segment {i} start must be before end")

        # 2. Simulate the 'split' by generating a virtual URL
        validated_segments.append({
            "segment_id": i + 1,
            "url": f"{video.video_url}_segment_{i+1}.mp4",
            "start": seg.start,
            "end": seg.end
        })
    
    return validated_segments