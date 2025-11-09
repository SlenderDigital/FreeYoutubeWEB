from fastapi import FastAPI, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from sqlmodel import Session
from backend.database.models import Video
from backend.utils import video_exist, update_object_property, find_video
from backend.youtube.yt_logic import fetch_video_info, download_video_logic, upload_video_logic
from backend.database.database import create_db_and_tables, engine, get_session
from backend.routers import history
import os.path


@asynccontextmanager
async def lifespan(app: FastAPI):  ## 'app' needed even if not used
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add /api prefix to history router
app.include_router(history.router, prefix="/api")


@app.get("/api/yt/video-info")
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


@app.get("/api/yt/download_video")
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

        # Return file for direct download
        filename = os.path.basename(file_path)
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='video/mp4'
        )
    except Exception as e:
        print(f"Error in download_yt_video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {str(e)}")


@app.get("/api/yt/upload/")
def upload_video(
        video_title: str = Query(..., description="Title of the video"),
        video_res: str = Query(..., description="Resolution of the video"),
):
    try:
        return upload_video_logic(video_title, video_res)
    except Exception as e:
        return {"error": str(e)}


