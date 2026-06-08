import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Sparkles, ListMusic, BarChart3, Disc3, Heart, Plus, ThumbsUp, Music, Mic2, Archive, PanelLeftClose } from 'lucide-react';
import { api } from '../api/client';
import type { Playlist } from '../types';

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: <Home size={20} />, section: 'music' as const },
  { to: '/trending', label: 'Trending', icon: <TrendingUp size={20} />, section: 'music' as const },
  { to: '/new', label: 'New', icon: <Sparkles size={20} />, section: 'music' as const },
  { to: '/artists', label: 'Artists', icon: <Mic2 size={20} />, section: 'music' as const },
  { to: '/playlists', label: 'Playlists', icon: <ListMusic size={20} />, section: 'music' as const },
  { to: '/charts', label: 'Charts', icon: <BarChart3 size={20} />, section: 'music' as const },
  { to: '/search', label: 'Genres', icon: <Disc3 size={20} />, section: 'music' as const },
  { to: '/liked', label: 'Favourites', icon: <Heart size={20} />, section: 'library' as const },
  { to: '/playlists', label: 'My PlayLists', icon: <Music size={20} />, section: 'library' as const },
  { to: '/recommended', label: 'Recommended', icon: <ThumbsUp size={20} />, section: 'buzz' as const },
  { to: '/archived', label: 'Archived', icon: <Archive size={20} />, section: 'buzz' as const },
];

export function Sidebar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const createPlaylist = async () => {
    const name = prompt('Playlist name:');
    if (name) {
      try {
        const res = await api.post<Playlist>('/playlists', { name, isPublic: true });
        navigate(`/playlist/${res.data.id}`);
      } catch (err) { console.error(err); }
    }
  };

  const isActive = (to: string, label: string) => {
    if (to === '/') return pathname === '/';
    if (to === '/search') return pathname.startsWith('/search');
    if (label === 'Add Playlist') return false;
    return pathname.startsWith(to);
  };

  const musicItems = NAV_ITEMS.filter(i => i.section === 'music');
  const libraryItems = NAV_ITEMS.filter(i => i.section === 'library');
  const buzzItems = NAV_ITEMS.filter(i => i.section === 'buzz');

  return (
    <aside className="bg-surface flex flex-col overflow-y-auto hide-scrollbar w-[18rem] shrink-0">
      <div className="p-4 pb-2 space-y-1">
        <div className="flex items-center justify-between px-2.5 mb-1">
          <p className="text-lg uppercase text-text-subdued tracking-widest font-bold">Music</p>
          <button onClick={onToggleSidebar} className="p-1.5 text-text-primary hover:text-red-300 rounded-md hover:bg-surface-highlight transition-colors" title="Hide sidebar">
            <PanelLeftClose size={18} />
          </button>
        </div>
        {musicItems.map(item => (
          <NavItem key={item.label} onClick={() => navigate(item.to)} icon={item.icon} label={item.label} active={isActive(item.to, item.label)} />
        ))}
      </div>

      <div className="px-4 pb-2 space-y-1">
        <p className="text-lg uppercase text-text-subdued tracking-widest font-bold px-2.5 mb-1">Library</p>
        <NavItem onClick={createPlaylist} icon={<Plus size={16} />} label="Add Playlist" active={false} />
        {libraryItems.map(item => (
          <NavItem key={item.label} onClick={() => navigate(item.to)} icon={item.icon} label={item.label} active={isActive(item.to, item.label)} />
        ))}
      </div>

      <div className="px-4 space-y-1">
        <p className="text-lg uppercase text-text-subdued tracking-widest font-bold px-2.5 mb-1">Buzz</p>
        {buzzItems.map(item => (
          <NavItem key={item.label} onClick={() => navigate(item.to)} icon={item.icon} label={item.label} active={isActive(item.to, item.label)} />
        ))}
      </div>

      <div className="mt-auto p-4 text-xs text-text-subdued text-center border-t border-surface-elevated">
        Aacoustix &copy; 2026
      </div>
    </aside>
  );
}

function NavItem({ onClick, icon, label, active }: { onClick: () => void; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <button onClick={onClick} className={`relative flex w-full items-center gap-3 pl-2.5 py-2 text-sm font-semibold rounded-r transition-colors ${active ? 'text-red-300' : 'text-text-primary hover:text-white'}`}>
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-400 rounded-r-full" />}
      <span className={`shrink-0 ${active ? 'text-red-400' : 'text-text-primary'}`}>{icon}</span>
      {label}
    </button>
  );
}