import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Clock, LogOut, Mic2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export function TopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isArtist, setIsArtist] = useState(false);

  useEffect(() => {
    api.get('/artists/me').then(() => setIsArtist(true)).catch(() => setIsArtist(false));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="bg-surface border-b border-surface-elevated flex items-center gap-4 px-6 py-2.5 z-10">
      {onToggleSidebar && (
        <button onClick={onToggleSidebar} className="md:hidden p-1.5 text-blue-300 hover:text-red-300 rounded-md hover:bg-surface-highlight transition-colors" title="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      )}
      <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => navigate('/home')}>
        <svg width="28" height="32" viewBox="0 0 40 46" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="acxT" x1="0" y1="0" x2="40" y2="20">
              <stop offset="0%" stopColor="#F58529"/>
              <stop offset="30%" stopColor="#FB6B7B"/>
              <stop offset="60%" stopColor="#E83FA8"/>
              <stop offset="100%" stopColor="#9B30D9"/>
            </linearGradient>
            <linearGradient id="acxL" x1="0" y1="20" x2="20" y2="46">
              <stop offset="0%" stopColor="#8134AF"/>
              <stop offset="50%" stopColor="#3469F5"/>
              <stop offset="100%" stopColor="#1A8FE5"/>
            </linearGradient>
            <linearGradient id="acxR" x1="20" y1="20" x2="40" y2="46">
              <stop offset="0%" stopColor="#5B2D8E"/>
              <stop offset="50%" stopColor="#1A6BC4"/>
              <stop offset="100%" stopColor="#21B2E8"/>
            </linearGradient>
          </defs>
          <polygon points="20,5 37,16 20,27 3,16" fill="url(#acxT)"/>
          <polygon points="20,27 37,16 37,33 20,44" fill="url(#acxR)"/>
          <polygon points="20,27 3,16 3,33 20,44" fill="url(#acxL)"/>
        </svg>
        <span className="text-xl font-bold text-transparent bg-clip-text tracking-tight" style={{ backgroundImage: 'linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #3469F5, #21B2E8)' }}>Aacoustix</span>
      </div>

      <form onSubmit={handleSearch} className="relative flex-1 max-w-md mx-auto">
        <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subdued" />
        <input
          ref={inputRef}
          type="text"
          placeholder='Search songs or artists... (Ctrl+K)'
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full py-2 pl-9 pr-3 rounded-full bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued transition-all"
        />
      </form>

      {user ? (
        <>
          {isArtist ? (
            <button onClick={() => navigate('/artist-dashboard')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors shrink-0">
              <LayoutDashboard size={14} /> Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/become-artist')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors shrink-0">
              <Mic2 size={14} /> Become an Artist
            </button>
          )}
          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/recent')} className="p-2 text-blue-300 hover:text-red-300 rounded-full hover:bg-surface-highlight transition-colors" title="Recent">
              <Clock size={16} />
            </button>
            <div className="w-px h-5 bg-surface-elevated mx-1" />
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 pl-1 hover:opacity-80 transition-opacity" title="Profile">
              <span className="flex items-center justify-center w-7 h-7 text-xs font-bold bg-accent text-white rounded-full shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.[0] || '?'
                )}
              </span>
              <span className="text-xs font-semibold truncate max-w-[80px] hidden md:inline text-text-primary">{user?.displayName}</span>
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="p-2 text-blue-300 hover:text-red-300 rounded-full hover:bg-surface-highlight transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </>
      ) : (
          <button onClick={() => navigate('/login')} className="px-4 py-1.5 rounded-full bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors shrink-0">
          Sign In
        </button>
      )}
    </header>
  );
}