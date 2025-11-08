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

  // Cargar historial del localStorage al iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem('videoHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('videoHistory', JSON.stringify(history));
    }
  }, [history]);

  // Función para sanitizar el nombre del archivo
  const sanitizeFilename = (filename) => {
    // Reemplazar caracteres inválidos con guión bajo
    return filename.replace(/[\\/*?:"<>|]/g, '_');
  };

  const handleSearch = async (videoUrl) => {
    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await axios.get(`${API_URL}/yt/video-info`, {
        params: { video_url: videoUrl }
      });

      setVideoInfo(response.data);

      // Agregar al historial (evitar duplicados)
      const existingIndex = history.findIndex(item => item.url === videoUrl);
      if (existingIndex === -1) {
        const newHistory = [{
          ...response.data,
          url: videoUrl,
          searchedAt: new Date().toISOString()
        }, ...history].slice(0, 20); // Mantener solo los últimos 20
        setHistory(newHistory);
      } else {
        // Mover al principio si ya existe
        const newHistory = [...history];
        const item = newHistory.splice(existingIndex, 1)[0];
        item.searchedAt = new Date().toISOString();
        newHistory.unshift(item);
        setHistory(newHistory);
      }
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
    } catch (err) {
      alert('Error al descargar el video: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSelectFromHistory = (item) => {
    setVideoInfo(item);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('videoHistory');
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