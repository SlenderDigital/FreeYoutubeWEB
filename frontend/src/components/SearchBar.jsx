import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

const SearchBar = ({ onSearch, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-yt-dark border-2 border-yt-darker rounded-xl overflow-hidden focus-within:border-yt-red transition-all duration-200 hover:border-yt-gray">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega aquí la URL del video de YouTube..."
            className="flex-1 bg-transparent px-6 py-4 text-white placeholder-yt-gray focus:outline-none text-lg"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-yt-red hover:bg-yt-red-hover disabled:bg-yt-gray disabled:cursor-not-allowed px-8 py-4 transition-all duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Search className="w-6 h-6 text-white" />
            )}
            <span className="text-white font-semibold hidden sm:block">
              {loading ? 'Buscando...' : 'Buscar'}
            </span>
          </button>
        </div>
      </form>

      <p className="text-yt-gray text-sm mt-3 text-center">
        Ejemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
      </p>
    </div>
  );
};

export default SearchBar;