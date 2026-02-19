import ffmpeg
import os
import uuid

def process_video_split(video, segments_metadata):
    processed_segments = []
    input_file = video.file_path

    # Ensure segment directory exists
    output_folder = f"uploads/segments/{video.id}"
    os.makedirs(output_folder, exist_ok=True)

    for i, meta in enumerate(segments_metadata):

        # 🔥 Normalize meta (Pydantic object or dict)
        if hasattr(meta, "start") and hasattr(meta, "end"):
            start_time = float(meta.start)
            end_time = float(meta.end)
        elif isinstance(meta, dict):
            start_time = float(meta["start"])
            end_time = float(meta["end"])
        else:
            raise ValueError("Invalid segment format")

        duration = end_time - start_time

        if duration <= 0:
            raise ValueError("End time must be greater than start time")

        segment_filename = f"segment_{i}_{uuid.uuid4().hex[:6]}.mp4"
        segment_path = os.path.join(output_folder, segment_filename)

        try:
            (
                ffmpeg
                .input(input_file, ss=start_time)
                .output(segment_path, t=duration, c="copy")
                .run(overwrite_output=True, capture_stdout=True, capture_stderr=True)
            )

            processed_segments.append({
                "id": i + 1,
                "start": start_time,
                "end": end_time,
                "url": f"http://localhost:8000/{segment_path}"
            })

        except ffmpeg.Error as e:
            error_msg = e.stderr.decode() if e.stderr else str(e)
            print(f"FFmpeg Error: {error_msg}")
            raise Exception(f"FFmpeg failed: {error_msg}")

    return processed_segments
