# Free YouTube WEB

A comprehensive **backend** for the Free YouTube project, featuring a REST API and database integration. This application allows users to fetch YouTube video information, download videos in various resolutions, and manage a local video library.

## 🚀 Features

- **Video Information Retrieval**: Fetch YouTube video metadata including title, duration, and available resolutions
- **Video Download**: Download YouTube videos in multiple resolutions (2160p, 1440p, 1080p, 720p, 480p)
- **Database**: SQLite database for tracking downloaded videos and their formats
- **History**: View and manage your download history (for now only one person)

## 📋 API Endpoints

### Video Operations
- `GET /yt/video-info` - Retrieve video information and available resolutions
- `GET /yt/download_video` - Download a YouTube video in specified resolution
- `GET /yt/upload/` - Serve downloaded videos for streaming/download

### History Management
- `GET /history/videos` - Get all downloaded videos history
- `GET /history/video/` - Get specific video by title
- `PUT /history/video/edit-title` - Edit video title
- `PATCH /history/video/resolution` - Remove specific resolution from video

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- FFmpeg (for video/audio merging)
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd free-youtube-backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create storage directory**
   ```bash
   mkdir storage
   ```

4. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000` with automatic documentation at `http://localhost:8000/docs`.

## Project Structure

```
app/
├── __init__.py
├── main.py              # FastAPI application and main endpoints
├── config.py            # Configuration constants
├── utils.py             # Utility functions for YouTube and database operations
├── database/
│   ├── __init__.py
│   ├── database.py      # Database connection and session management
│   ├── models.py        # SQLModel database models
│   └── sqlite/          # SQLite database files
├── routers/
│   ├── history.py       # History management endpoints
│   └── users.py         # User management (placeholder)
└── youtube/
    ├── __init__.py
    └── yt_logic.py       # YouTube download and processing logic
```

## Configuration

### Video Storage Path

The project uses a `VIDEO_STORAGE` constant in `app/config.py` to define where downloaded videos are stored:

```python
VIDEO_STORAGE = Path("storage")
```

**Important**: Be careful with this path. Make sure:
- The directory exists and has proper write permissions
- You have sufficient disk space for video downloads
- The path is accessible by the application

### Supported Resolutions

The application supports the following video resolutions:
- 2160p (4K)
- 1440p (2K)
- 1080p (Full HD)
- 720p (HD)
- 480p (Standard)

## Database Schema

The application uses SQLite with the following models:

### Video Model
- `id`: Primary key
- `title`: Video title (max 100 characters)
- `duration`: Video duration in HH:MM:SS format
- `url`: Original YouTube URL
- `file_path`: Local file path (when downloaded)

### Format Model
- `id`: Primary key
- `resolution`: Video resolution (e.g., "1080p")
- `size`: File size (e.g., "150 MB")
- `video_id`: Foreign key to Video

## Usage Examples

### Get Video Information
```bash
curl "http://localhost:8000/yt/video-info?video_url=https://youtube.com/watch?v=VIDEO_ID"
```

### Download Video
```bash
curl "http://localhost:8000/yt/download_video?video_url=https://youtube.com/watch?v=VIDEO_ID&resolution=1080p"
```

### View Download History
```bash
curl "http://localhost:8000/history/videos"
```

## 🛠Running Individual Files

To execute any Python file within the project, use the following command from the project root:

```bash
python -m app.PACKAGE.FILE
```

For example:
```bash
python -m app.youtube.yt_logic
python -m app.database.models
```


### Support

For issues and support, please check the project's issue tracker or documentation.
