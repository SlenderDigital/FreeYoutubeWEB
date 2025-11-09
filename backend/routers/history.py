import glob

from fastapi import APIRouter, Query, Depends, HTTPException
from sqlmodel import Session, select
from backend.database.database import get_session
from backend.database.models import *
from backend.utils import all_videos, update_object_property, find_video
from backend.config import VIDEO_STORAGE
import os

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/videos")
def get_videos_history(*, session: Session = Depends(get_session)) -> List[dict]:
    """Get all videos from database history"""
    videos = session.exec(select(Video)).all()
    if not videos:
        return []  # Return empty list instead of 404

    # Include resolutions (formats) for each video
    return all_videos(videos)


@router.get("/video/")
def get_video(*,
              title: str = Query(..., description="title of the video"),
              session: Session = Depends(get_session)
              ) -> dict:
    videos = session.exec(select(Video)).all()
    if not videos:
        raise HTTPException(status_code=404, detail="Not even a single video")
    for video in all_videos(videos):
        if video["title"] == title: return video
    raise HTTPException(status_code=404, detail="video not found")


@router.put("/video/edit-title")
def edit_title(*,
               title: str = Query(..., description="Title"),
               new_title: str = Query(..., description="New title"),
               session: Session = Depends(get_session)
               ) -> dict:
    videos = session.exec(select(Video)).all()
    for video in videos:
        if video.title == title:
            update_object_property(video, "title", new_title, session)
            return find_video(video)
    raise HTTPException(status_code=404, detail="not video with that title my bro")


@router.put("/video/update")
def update_video(*,
                 video_id: int = Query(..., description="ID of the video to update"),
                 video_data: dict,
                 session: Session = Depends(get_session)
                 ) -> dict:
    """Update video information by ID"""
    video = session.get(Video, video_id)

    if not video:
        raise HTTPException(status_code=404, detail=f"Video with ID {video_id} not found")

    updated_fields = []
    if "title" in video_data and video_data["title"] is not None:
        video.title = video_data["title"]
        updated_fields.append("title")

    if "duration" in video_data and video_data["duration"] is not None:
        video.duration = video_data["duration"]
        updated_fields.append("duration")

    if "url" in video_data and video_data["url"] is not None:
        video.url = video_data["url"]
        updated_fields.append("url")

    if "file_path" in video_data and video_data["file_path"] is not None:
        video.file_path = video_data["file_path"]
        updated_fields.append("file_path")

    if not updated_fields:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    session.add(video)
    session.commit()
    session.refresh(video)

    result = find_video(video)
    result["updated_fields"] = updated_fields

    return result


@router.patch("/video/resolution")
def delete_resolution(*,
                      title: str = Query(..., description="title of the video"),
                      resolution: str = Query(..., description="delete available resolution"),
                      session: Session = Depends(get_session)
                      ) -> dict:
    videos = session.exec(select(Video)).all()
    for video in videos:
        if video.title == title:
            for fmt in video.formats:
                if fmt.resolution == resolution:
                    session.delete(fmt)
                    session.commit()
                    return {"message": f"Resolution {resolution} deleted successfully"}
    raise HTTPException(status_code=404, detail="not video with that resolution and title")


@router.delete("/clear")
def clear_all_history(*, session: Session = Depends(get_session)) -> dict:

    try:
        videos = session.exec(select(Video)).all()

        deleted_count = len(videos)

        for video in videos:
            for fmt in video.formats:
                session.delete(fmt)

        for video in videos:
            session.delete(video)

        session.commit()

        video_files = glob.glob(os.path.join(VIDEO_STORAGE, "*.mp4"))
        files_deleted = 0
        for file_path in video_files:
            try:
                os.remove(file_path)
                files_deleted += 1
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")

        return {
            "message": "Historial limpiado exitosamente",
            "videos_deleted": deleted_count,
            "files_deleted": files_deleted
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error al limpiar historial: {str(e)}")