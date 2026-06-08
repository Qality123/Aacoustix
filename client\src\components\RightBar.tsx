import { useLocation, useNavigate } from 'react-router-dom';
import { User, Clock, Library, Mic2, LayoutDashboard, Heart, ExternalLink } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const ACCOUNT_ITEMS = [
  { to: '/profile', label: 'Profile', icon: <User size={16} /> },
  { to: '/recent', label: 'Recently Played', icon: <Clock size={16} /> },
  { to: '/liked', label: 'Favourites', icon: <Heart size={16} /> },
  { to: '/library', label: 'Library', icon: <Library size={16} /> },
];

const STUDIO_ITEMS = [
  { to: '/become-artist', label: 'Become an Artist', icon: <Mic2 size={16} /> },
  { to: '/artist-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
];

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'X (Twitter)', href: 'https://x.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
];

export function RightBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  void usePlayer();

  const isActive = (to: string) => pathname.startsWith(to);

  return (
    <aside className="bg-surface flex flex-col overflow-y-auto hide-scrollbar w-56 shrink-0 border-l border-surface-elevated">
      <div className="p-4 pb-2 space-y-1">
        <p className="text-base uppercase text-text-subdued tracking-widest font-semibold px-2.5 mb-1">Account</p>
        {ACCOUNT_ITEMS.map(item => (
          <NavItem key={item.label} onClick={() => navigate(item.to)} icon={item.icon} label={item.label} active={isActive(item.to)} />
        ))}
      </div>

      <div className="px-4 pb-2 space-y-1">
        <p className="text-base uppercase text-text-subdued tracking-widest font-semibold px-2.5 mb-1">Studio</p>
        {STUDIO_ITEMS.map(item => (
          <NavItem key={item.label} onClick={() => navigate(item.to)} icon={item.icon} label={item.label} active={isActive(item.to)} />
        ))}
      </div>

      <div className="px-4 space-y-1">
        <p className="text-base uppercase text-text-subdued tracking-widest font-semibold px-2.5 mb-1">Connect</p>
        {SOCIALS.map(item => (
          <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
            className="relative flex w-full items-center gap-3 pl-2.5 py-2 text-sm font-semibold rounded-r text-text-secondary hover:text-text-primary transition-colors">
            <ExternalLink size={14} className="shrink-0" />
            {item.label}
          </a>
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
    <button onClick={onClick} className={`relative flex w-full items-center gap-3 pl-2.5 py-2 text-sm font-semibold rounded-r transition-colors ${active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
              <span className={`shrink-0 ${active ? 'text-red-400' : ''}`}>{icon}</span>
      {label}
    </button>
  );
}
