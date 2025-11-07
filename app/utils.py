from pytubefix import YouTube
from fastapi import Depends
from sqlmodel import Session, Sequence, select
from app.database.models import Video
from app.database.database import get_session
import re

"""YouTube Logic"""
def readable_size(size_in_bytes: int) -> str:
    """Convert bytes to human readable string."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_in_bytes < 1024:
            return f"{size_in_bytes:.2f} {unit}"
        size_in_bytes /= 1024
    return f"{size_in_bytes:.2f} PB"

def readable_duration(seconds: int) -> str:
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    return f"{hours:02}:{minutes:02}:{secs:02}"

def available_resolution(video: YouTube, RESOLUTIONS: list) -> dict:
    available_resolution = {}
    try:# Create a YouTube object
        for res in RESOLUTIONS:
            stream = video.streams.filter(res=res).first()
            if stream:
                size = readable_size(stream.filesize) if stream.filesize else "Unknown"
                available_resolution[res] = size
    except Exception as e:
        print(f"Error processing video URL: {e}")
    return available_resolution

def sanitize_filename(filename: str) -> str:
    # Replace invalid characters with underscores
    return re.sub(r'[\\/*?:"<>|]', '_', filename)

"""API Logic"""
def video_exist(video_url: str, session: Session) -> Video | None:
    history = session.exec(select(Video)).all()
    for v in history:
        if video_url == v.url:
            return v
    return None

def find_video(video: Video) -> dict | None:
    if not video:
        return None

    # Extract resolutions from the formats relationship
    resolutions = [{"resolution": fmt.resolution, "size": fmt.size} for fmt in video.formats]

    # Return video details along with resolutions
    return {
        "id": video.id,
        "title": video.title,
        "duration": video.duration,
        "url": video.url,
        "resolutions": resolutions,
    }

def all_videos(videos: Sequence[Video]): 
    """
    Used only for retrieved data
    This function only returns a readable copy of all videos in the database 
    """
    result = []
    for video in videos:
        resolutions = [{"resolution": fmt.resolution, "size": fmt.size} for fmt in video.formats]
        result.append({
            "id": video.id,
            "title": video.title,
            "duration": video.duration,
            "url": video.url,
            "resolutions": resolutions
        })
    
    return result

def update_object_property(
    obj: object, 
    property_name: str, 
    new_value: any, 
    session: Session
) -> object:

    # Update the property
    setattr(obj, property_name, new_value)
    
    # Commit the changes
    session.add(obj)  # Ensure the object is tracked by the session
    session.commit()
    session.refresh(obj)  # Refresh the object to get the latest state from the database
    
    return obj