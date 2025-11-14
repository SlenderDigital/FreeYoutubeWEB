import { useState } from 'react';
import { Download, Clock, CheckCircle } from 'lucide-react';

const VideoCard = ({ video, onDownload }) => {
  const [selectedResolution, setSelectedResolution] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!selectedResolution) {
      alert('Por favor selecciona una resolución');
      return;
    }

    setDownloading(true);
    try {
      await onDownload(video.url, selectedResolution);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-yt-dark rounded-xl overflow-hidden border border-yt-darker hover:border-yt-red transition-all duration-300 fade-in shadow-2xl">
      {/* Información del video */}
      <div className="p-6 border-b border-yt-darker">
        <h2 className="text-2xl font-bold text-white mb-3 line-clamp-2">
          {video.title}
        </h2>
        <div className="flex items-center space-x-4 text-yt-gray">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{video.duration}</span>
          </div>
        </div>
      </div>

      {/* Selector de resolución */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="bg-yt-red w-1 h-6 mr-3 rounded-full"></span>
          Selecciona la resolución
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {video.resolutions && video.resolutions.map((res) => (
            <button
              key={res.resolution}
              onClick={() => setSelectedResolution(res.resolution)}
              className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 group ${
                selectedResolution === res.resolution
                  ? 'bg-yt-red border-yt-red shadow-lg shadow-yt-red/20'
                  : 'bg-yt-darker border-yt-darker hover:border-yt-red'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className={`font-bold text-lg ${
                  selectedResolution === res.resolution ? 'text-white' : 'text-yt-gray group-hover:text-white'
                }`}>
                  {res.resolution}
                </span>
                <span className={`text-xs ${
                  selectedResolution === res.resolution ? 'text-white/80' : 'text-yt-gray group-hover:text-yt-gray'
                }`}>
                  {res.size}
                </span>
              </div>
              {selectedResolution === res.resolution && (
                <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-white" />
              )}
            </button>
          ))}
        </div>

        {/* Botón de descarga */}
        <button
          onClick={handleDownload}
          disabled={!selectedResolution || downloading}
          className="w-full bg-yt-red hover:bg-yt-red-hover disabled:bg-yt-gray disabled:cursor-not-allowed py-4 rounded-lg font-bold text-white text-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:shadow-yt-red/20"
        >
          <Download className={`w-6 h-6 ${downloading ? 'animate-bounce' : ''}`} />
          <span>
            {downloading ? 'Descargando...' : 'Descargar Video'}
          </span>
        </button>

        {selectedResolution && (
          <p className="text-yt-gray text-sm mt-3 text-center">
            Se descargará en {selectedResolution} ({video.resolutions.find(r => r.resolution === selectedResolution)?.size})
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoCard;