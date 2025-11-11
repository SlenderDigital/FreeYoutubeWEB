from fastapi import APIRouter, Query, Depends, HTTPException
from sqlmodel import Session, select
from backend.database.database import get_session
from backend.database.models import *
from backend.utils import all_videos, update_object_property, find_video
from backend.config import VIDEO_STORAGE
import os
import glob

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/videos")
def get_videos_history(*, session: Session = Depends(get_session)) -> List[dict]:
    # Query all videos
    videos = session.exec(select(Video)).all()
    if not videos:
        return []  # Devolver lista vacía en lugar de error

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


@router.delete("/clear")
def clear_all_history(*, session: Session = Depends(get_session)) -> dict:
    """
    Elimina todo el historial: datos de la base de datos y archivos descargados
    """
    try:
        # Obtener todos los videos
        videos = session.exec(select(Video)).all()

        deleted_count = len(videos)

        # Eliminar todos los formatos primero (por la relación FK)
        for video in videos:
            for fmt in video.formats:
                session.delete(fmt)

        # Eliminar todos los videos de la BD
        for video in videos:
            session.delete(video)

        session.commit()

        # Eliminar todos los archivos de video del storage
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


@router.delete("/video/{video_id}")
def delete_video(*, video_id: int, session: Session = Depends(get_session)) -> dict:
    """
    Elimina un video específico del historial junto con sus archivos descargados
    """
    try:
        # Buscar el video por ID
        video = session.get(Video, video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video no encontrado")

        video_title = video.title

        # Eliminar formatos relacionados
        for fmt in video.formats:
            session.delete(fmt)

        # Eliminar el video de la BD
        session.delete(video)
        session.commit()

        # Eliminar archivos relacionados del storage
        from backend.utils import sanitize_filename
        sanitized_title = sanitize_filename(video_title)
        pattern = os.path.join(VIDEO_STORAGE, f"{sanitized_title}_*.mp4")
        video_files = glob.glob(pattern)

        files_deleted = 0
        for file_path in video_files:
            try:
                os.remove(file_path)
                files_deleted += 1
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")

        return {
            "message": f"Video '{video_title}' eliminado exitosamente",
            "files_deleted": files_deleted
        }
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar video: {str(e)}")