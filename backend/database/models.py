from sqlmodel import Field, SQLModel, Relationship
from typing import List, Optional

class Video(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=100)
    duration: str = Field(max_length=8)
    url: str
    file_path: Optional[str] = None

    # One-to-Many relationship with Format
    formats: List["Format"] = Relationship(back_populates="video")

class Format(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resolution: str = Field(max_length=5)
    size: str = Field(max_length=9)  # e.g., "99 MB"

    # Foreign key to Video
    video_id: int = Field(foreign_key="video.id")
    video: Video = Relationship(back_populates="formats")

