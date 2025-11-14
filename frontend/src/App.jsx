import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import VideoCard from './components/VideoCard';
import History from './components/History';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const sanitizeFilename = (filename) => {
  return filename.replace(/[\\/*?:"<>|]/g, '_');
};

function App() {
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Cargar historial de la base de datos
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await axios.get(`${API_URL}/history/videos`);
      setHistory(response.data);
    } catch (err) {
      // Si no hay videos, simplemente dejar el array vacío
      if (err.response?.status === 404) {
        setHistory([]);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  // Cargar historial al iniciar
  useEffect(() => {
    loadHistory();
  }, []);

  const handleSearch = async (videoUrl) => {
    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await axios.get(`${API_URL}/yt/video-info`, {
        params: { video_url: videoUrl }
      });

      setVideoInfo(response.data);

      // Recargar historial después de buscar un video
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al buscar el video. Verifica la URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (videoUrl, resolution) => {
    try {
      const response = await axios.get(`${API_URL}/yt/download_video`, {
        params: {
          video_url: videoUrl,
          resolution: resolution
        },
        responseType: 'blob'
      });

      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const videoTitle = videoInfo ? videoInfo.title : 'video';
      const sanitizedTitle = sanitizeFilename(videoTitle);
      const filename = `${sanitizedTitle}_${resolution}.mp4`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al descargar el video: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSelectFromHistory = (item) => {
    setVideoInfo(item);
    setShowHistory(false);
  };

  const clearHistory = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todo el historial y los videos descargados?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/history/clear`);
      setHistory([]);
      setVideoInfo(null);
      alert('Historial limpiado exitosamente');
    } catch (err) {
      alert('Error al limpiar el historial: ' + (err.response?.data?.detail || err.message));
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      await axios.delete(`${API_URL}/history/video/${videoId}`);

      // Actualizar el historial después de eliminar
      await loadHistory();

      // Si el video eliminado era el que estaba mostrando, limpiar la vista
      if (videoInfo && videoInfo.id === videoId) {
        setVideoInfo(null);
      }
    } catch (err) {
      alert('Error al eliminar el video: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-yt-black">
      <Header onToggleHistory={() => setShowHistory(!showHistory)} historyCount={history.length} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {error && (
          <div className="bg-yt-red/10 border border-yt-red text-yt-red px-6 py-4 rounded-lg mb-6 fade-in">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {showHistory && (
          <History
            history={history}
            onSelect={handleSelectFromHistory}
            onClear={clearHistory}
            onDelete={deleteVideo}
            loading={loadingHistory}
          />
        )}

        {!showHistory && videoInfo && (
          <VideoCard
            video={videoInfo}
            onDownload={handleDownload}
          />
        )}
      </main>
    </div>
  );
}

export default App;