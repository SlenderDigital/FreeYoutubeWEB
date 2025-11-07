from fastapi import FastAPI, Query, Depends, HTTPException
from contextlib import asynccontextmanager
from sqlmodel import Session
from app.database.models import Video
from app.utils import video_exist, update_object_property, find_video
from app.youtube.yt_logic import fetch_video_info, download_video_logic, upload_video_logic
from app.database.database import create_db_and_tables, engine, get_session
from app.routers import history
import os.path


@asynccontextmanager
async def lifespan(app: FastAPI): ## 'app' needed even if not used
    create_db_and_tables()
    print(app.state)
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(history.router)

@app.get("/yt/video-info")
def get_video_info(
    *,
    video_url: str = Query(..., description="YouTube video URL"),
    session: Session = Depends(get_session)
) -> dict:
    try:
        # Check if the video exists in the database
        video = video_exist(video_url, session)
        if video is None:
            # Fetch video info if it doesn't exist
            new_video = fetch_video_info(video_url)
            if not new_video: raise HTTPException(status_code=404, detail="Check the URL!") 
            session.add(new_video)
            session.commit()
            video = new_video  # Use the newly added video

        # Return video details with resolutions
        return find_video(video=video)
    except Exception as e:
        raise HTTPException(status_code=505, detail=f"Error: {e}")
    

@app.get("/yt/download_video")
def download_yt_video(
    video_url: str = Query(..., description="YouTube video URL"),
    resolution: str = Query(default="720p", description="Resolution to download"),
    session: Session = Depends(get_session)
):
    try:
        # Attempt to download the video locally
        file_path = download_video_logic(video_url, resolution)

        # Check if the video exists in the database
        video = video_exist(video_url, session)
        if video is None:
            # Fetch video info and add it to the database
            video = fetch_video_info(video_url)
            if not video:
                raise HTTPException(status_code=404, detail="Failed to fetch video info.")
            update_object_property(video, "file_path", file_path, session)
        else:
            # Update the file_path for the existing video
            update_object_property(video, "file_path", file_path, session)

        return {"Status": "Video downloaded successfully", "file_path": file_path}
    except Exception as e:
        print(f"Error in download_yt_video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {str(e)}")

@app.get("/yt/upload/")
def upload_video(
    video_title: str = Query(..., description="Title of the video"),
    video_res: str = Query(..., description="Resolution of the video"),
):
    try:
        return upload_video_logic(video_title, video_res)
    except Exception as e:
        return {"error": str(e)}
    
