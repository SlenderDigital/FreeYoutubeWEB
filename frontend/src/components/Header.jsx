import { Download, History, Youtube } from 'lucide-react';

const Header = ({ onToggleHistory, historyCount }) => {
  return (
    <header className="bg-yt-dark border-b border-yt-darker sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
        <div className="flex items-center space-x-3">
          <div className="bg-yt-red p-2 rounded-lg">
            <Youtube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">YT Downloader</h1>
            <p className="text-xs text-yt-gray">Descarga videos en alta calidad</p>
          </div>
        </div>

        <button
          onClick={onToggleHistory}
          className="flex items-center space-x-2 bg-yt-darker hover:bg-yt-red transition-all duration-200 px-4 py-2 rounded-lg group"
        >
          <History className="w-5 h-5 text-yt-gray group-hover:text-white transition-colors" />
          <span className="text-yt-gray group-hover:text-white font-medium transition-colors">Historial</span>
          {historyCount > 0 && (
            <span className="bg-yt-red text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;