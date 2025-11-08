from fastapi import APIRouter, Query, Depends, HTTPException
from sqlmodel import Session, select
from backend.database.database import get_session
from backend.database.models import *
from backend.utils import all_videos, update_object_property, find_video

router = APIRouter(prefix="/history", tags=["history"])

@router.get("/videos")
def get_videos_history(*, session: Session = Depends(get_session)) -> List[dict]:
    # Query all videos
    videos = session.exec(select(Video)).all()
    if not videos:
        raise HTTPException(status_code=404, detail="No videos")

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


@router.put("video/edit-title")
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

@router.patch("video/resolution")
def update_resolution(*,
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
                    session.add(video)
                    session.commit()
                    return {"message": f"Resolution {resolution} deleted successfully"}
    raise HTTPException(status_code=404, detail="not video with that resolution and title")


@router.delete("/video/history")
def delete_history(*, session: Session = Depends(get_session)) -> dict:
    # Get all videos
    videos = session.exec(select(Video)).all()

    if not videos:
        raise HTTPException(status_code=404, detail="No videos to delete")

    # Delete all videos (this will cascade delete formats if configured)
    for video in videos:
        session.delete(video)

    session.commit()

    return {"message": f"Successfully deleted {len(videos)} videos from history"}