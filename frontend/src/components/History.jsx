import { Clock, Trash2, Download } from 'lucide-react';

const History = ({ history, onSelect, onClear }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="bg-yt-red w-1 h-8 mr-3 rounded-full"></span>
          Historial de Búsqueda
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center space-x-2 bg-yt-darker hover:bg-yt-red/20 text-yt-gray hover:text-yt-red transition-all duration-200 px-4 py-2 rounded-lg border border-yt-darker hover:border-yt-red"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Limpiar</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-yt-dark rounded-xl p-12 text-center border border-yt-darker">
          <Clock className="w-16 h-16 text-yt-gray mx-auto mb-4 opacity-50" />
          <p className="text-yt-gray text-lg">No hay videos en el historial</p>
          <p className="text-yt-gray text-sm mt-2">Los videos que busques aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelect(item)}
              className="bg-yt-dark hover:bg-yt-darker rounded-xl p-4 border border-yt-darker hover:border-yt-red transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-yt-red transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-yt-gray text-sm">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{item.resolutions?.length || 0} resoluciones</span>
                    </span>
                  </div>
                  {item.searchedAt && (
                    <p className="text-yt-gray text-xs mt-2">
                      {formatDate(item.searchedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;