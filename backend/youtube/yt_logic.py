from pytubefix import YouTube
from fastapi import HTTPException
from fastapi.responses import FileResponse
from backend.utils import *
from backend.database.models import Video, Format
from backend.config import RESOLUTIONS, VIDEO_STORAGE
import os
import subprocess
import imageio_ffmpeg

# Get FFmpeg executable path from imageio-ffmpeg
FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()

def fetch_video_info(video_url: str) -> Video:
    video = YouTube(video_url)
    resolutions = available_resolution(video, RESOLUTIONS)

    return Video(
        title=video.title,
        duration=readable_duration(video.length),
        url=video_url,
        formats=[
            Format(resolution=res, size=size) for res, size in resolutions.items()
        ]
    )


def download_video_logic(url: str, resolution: str) -> str:
    try:
        print("Connecting to YouTube...")
        video = YouTube(url)

        # Sanitize the video title for use as a filename
        sanitized_title = sanitize_filename(video.title)
        output_file = os.path.join(VIDEO_STORAGE, f"{sanitized_title}_{resolution}.mp4")

        # Check if the video is already downloaded
        if os.path.exists(output_file):
            print(f"Video already downloaded: {output_file}")
            return output_file

        # Get the video stream
        video_stream = video.streams.filter(res=resolution, only_video=True).first()
        if not video_stream:
            raise HTTPException(status_code=404, detail="Requested video resolution not available.")

        # Get the audio stream
        audio_stream = video.streams.filter(only_audio=True).first()
        if not audio_stream:
            raise HTTPException(status_code=404, detail="Requested video has no audio available.")

        print(f"Downloading video: {video.title}")
        video_file = video_stream.download(output_path=VIDEO_STORAGE, filename_prefix="video_")
        audio_file = audio_stream.download(output_path=VIDEO_STORAGE, filename_prefix="audio_")

        print("Merging video and audio...")
        # Use the FFmpeg path from imageio-ffmpeg
        subprocess.run([
            FFMPEG_PATH, '-i', video_file,
            '-i', audio_file,
            '-c:v', 'copy',
            '-c:a', 'aac',
            output_file,
        ], check=True)

        # Clean up temporary files
        os.remove(video_file)
        os.remove(audio_file)

        print(f"Download complete: {output_file}")
        return output_file
    except Exception as e:
        print(f"Error during download: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {str(e)}")


def upload_video_logic(video_title: str, video_res: str):
    try:
        file_path = os.path.join(VIDEO_STORAGE, f"{video_title}_{video_res}.mp4")
        return FileResponse(path=file_path, filename=f"{video_title}_{video_res}.mp4")
    except FileNotFoundError:
        raise FileNotFoundError(f"{video_title} at {video_res} doesn't exist")
