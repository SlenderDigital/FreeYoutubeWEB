import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import VideoCard from './components/VideoCard';
import History from './components/History';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

function App() {
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Función para sanitizar el nombre del archivo
  const sanitizeFilename = (filename) => {
    return filename.replace(/[\\/*?:"<>|]/g, '_');
  };

  // Cargar historial desde la base de datos
  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history/videos`);
      setHistory(response.data || []);
    } catch (err) {
      console.error('Error loading history:', err);
      setHistory([]);
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

      // Recargar el historial después de agregar el video
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

      // Obtener el título del video y sanitizarlo
      const videoTitle = videoInfo?.title || 'video';
      const sanitizedTitle = sanitizeFilename(videoTitle);
      const filename = `${sanitizedTitle}_${resolution}.mp4`;

      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Recargar historial después de descargar
      await loadHistory();
    } catch (err) {
      alert('Error al descargar el video: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSelectFromHistory = (item) => {
    setVideoInfo(item);
    setShowHistory(false);
  };

  const clearHistory = async () => {
    const confirmed = window.confirm(
      '⚠️ ADVERTENCIA: Esto eliminará TODOS los videos de la base de datos y TODOS los archivos descargados. ¿Estás seguro?'
    );

    if (!confirmed) return;

    try {
      const response = await axios.delete(`${API_URL}/history/clear-all`);

      // Limpiar estado local
      setHistory([]);
      setVideoInfo(null);

      // Mostrar mensaje de éxito
      alert(
        `✅ Historial limpiado exitosamente:\n` +
        `- ${response.data.videos_deleted} videos eliminados de la base de datos\n` +
        `- ${response.data.files_deleted} archivos eliminados del almacenamiento`
      );

      // Recargar historial (debería estar vacío)
      await loadHistory();
    } catch (err) {
      alert('Error al limpiar el historial: ' + (err.response?.data?.detail || err.message));
    }
  };

  const deleteVideo = async (videoId) => {
    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este video y sus archivos?');

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/history/video/${videoId}`);

      // Recargar historial
      await loadHistory();

      // Si el video eliminado es el que se está mostrando, limpiarlo
      if (videoInfo?.id === videoId) {
        setVideoInfo(null);
      }

      alert('Video y archivos eliminados exitosamente');
    } catch (err) {
      alert('Error al eliminar el video: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-yt-black">
      <Header
        onToggleHistory={() => setShowHistory(!showHistory)}
        historyCount={history.length}
      />

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