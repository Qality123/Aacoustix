import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X, Mic2, ExternalLink } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PlayerBar } from './PlayerBar';
import { SongDetailPanel } from './SongDetailPanel';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import type { Artist } from '../types';

export function Layout() {
  const { loading } = useAuth();
  const { currentSong } = usePlayer();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [songDetailOpen, setSongDetailOpen] = useState(true);
  const [artistOverlay, setArtistOverlay] = useState<Artist | null>(null);

  if (loading) return <div className="flex items-center justify-center h-screen text-text-secondary text-lg">Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      <TopBar onToggleSidebar={() => setSidebarOpen(o => !o)} />
      <div className="flex-1 flex overflow-hidden relative">
        {sidebarOpen && (
          <div className="hidden md:flex"><Sidebar onToggleSidebar={() => setSidebarOpen(o => !o)} /></div>
        )}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 h-full" onClick={e => e.stopPropagation()}>
              <Sidebar onToggleSidebar={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}
        <main className={`flex-1 overflow-y-auto px-4 sm:px-8 pt-6 pb-6 bg-gradient-to-b from-surface via-surface to-surface hide-scrollbar flex flex-col ${!sidebarOpen ? 'md:ml-10' : ''} ${!songDetailOpen ? 'md:mr-10' : ''}`}>
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="py-8 mt-8 border-t border-surface-elevated text-base text-text-subdued">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6 text-center sm:text-left">
              <div>
                <h4 className="text-text-primary font-semibold mb-2 text-sm">Platform</h4>
                <ul className="space-y-1">
                  <li><a href="/home" className="hover:text-text-primary transition">Home</a></li>
                  <li><a href="/trending" className="hover:text-text-primary transition">Trending</a></li>
                  <li><a href="/new" className="hover:text-text-primary transition">New Releases</a></li>
                  <li><a href="/charts" className="hover:text-text-primary transition">Charts</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-text-primary font-semibold mb-2 text-sm">Library</h4>
                <ul className="space-y-1">
                  <li><a href="/playlists" className="hover:text-text-primary transition">Playlists</a></li>
                  <li><a href="/liked" className="hover:text-text-primary transition">Favourites</a></li>
                  <li><a href="/recent" className="hover:text-text-primary transition">Recent</a></li>
                  <li><a href="/artists" className="hover:text-text-primary transition">Artists</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-text-primary font-semibold mb-2 text-sm">Profile</h4>
                <ul className="space-y-1">
                  <li><a href="/profile" className="hover:text-text-primary transition">My Profile</a></li>
                  <li><a href="/artist-dashboard" className="hover:text-text-primary transition">Artist Dashboard</a></li>
                  <li><a href="/become-artist" className="hover:text-text-primary transition">Become an Artist</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-text-primary font-semibold mb-2 text-sm">Follow Us</h4>
                <ul className="space-y-1">
                  <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition flex items-center justify-center sm:justify-start gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    Instagram
                  </a></li>
                  <li><a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition flex items-center justify-center sm:justify-start gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46L20 4" /></svg>
                    X (Twitter)
                  </a></li>
                  <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition flex items-center justify-center sm:justify-start gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 8.75 9.75 15.25 15.5 12 9.75 8.75" /></svg>
                    YouTube
                  </a></li>
                  <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition flex items-center justify-center sm:justify-start gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    Facebook
                  </a></li>
                </ul>
              </div>
            </div>
            <div className="text-center pt-4 border-t border-surface-elevated">
              <p>&copy; {new Date().getFullYear()} Aacoustix. All rights reserved.</p>
              <p className="mt-1">Made with &hearts; for music lovers everywhere.</p>
            </div>
          </footer>
        </main>
        {songDetailOpen && (
          currentSong ? (
            <SongDetailPanel song={currentSong} onClose={() => setSongDetailOpen(false)} onViewArtist={setArtistOverlay} />
          ) : (
            <div className="w-72 lg:w-80 bg-surface-secondary border-l border-surface-elevated overflow-y-auto shrink-0 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-elevated">
                <h3 className="text-sm font-semibold">Song Details</h3>
                <button onClick={() => setSongDetailOpen(false)} className="p-1 text-text-secondary hover:text-text-primary rounded transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className="p-4 text-text-secondary text-sm text-center mt-10">
                No song playing
              </div>
            </div>
          )
        )}
      </div>
      <PlayerBar onOpenSongDetail={() => setSongDetailOpen(true)} />
      {!sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-14 bottom-[80px] z-40 bg-surface-secondary border-r border-surface-elevated flex items-center justify-center px-3 text-white hover:text-red-300 transition shadow-lg cursor-pointer"
          title="Show sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}
      {!songDetailOpen && (
        <div
          onClick={() => setSongDetailOpen(true)}
          className="fixed right-0 top-14 bottom-[80px] z-40 bg-surface-secondary border-l border-surface-elevated flex items-center justify-center px-3 text-white hover:text-red-300 transition shadow-lg cursor-pointer"
          title="Show song details"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}
      {artistOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setArtistOverlay(null)}>
          <div className="bg-surface-secondary rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-elevated">
              <h3 className="text-sm font-semibold">About Artist</h3>
              <button onClick={() => setArtistOverlay(null)} className="p-1 text-text-secondary hover:text-text-primary rounded transition">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                {artistOverlay.imageUrl ? (
                  <img src={artistOverlay.imageUrl} alt={artistOverlay.name} className="w-20 h-20 rounded-full object-cover shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-surface-elevated flex items-center justify-center"><Mic2 size={32} className="text-text-subdued" /></div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{artistOverlay.name}</h2>
                  <p className="text-text-secondary text-sm">Artist</p>
                </div>
              </div>
              {artistOverlay.bio && (
                <p className="text-text-secondary text-sm leading-relaxed">{artistOverlay.bio}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {artistOverlay.genre && <span className="px-3 py-1 rounded-full bg-surface-elevated text-text-secondary text-xs">{artistOverlay.genre}</span>}
                {artistOverlay.country && <span className="px-3 py-1 rounded-full bg-surface-elevated text-text-secondary text-xs">{artistOverlay.country}</span>}
                {artistOverlay.recordLabel && <span className="px-3 py-1 rounded-full bg-surface-elevated text-text-secondary text-xs">{artistOverlay.recordLabel}</span>}
                {artistOverlay.fullName && <span className="px-3 py-1 rounded-full bg-surface-elevated text-text-secondary text-xs">{artistOverlay.fullName}</span>}
              </div>
              {artistOverlay.whatILove && (
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">What I Love</h4>
                  <p className="text-text-secondary text-sm leading-relaxed">{artistOverlay.whatILove}</p>
                </div>
              )}
              {artistOverlay.website && (
                <a href={artistOverlay.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent text-sm hover:underline">
                  <ExternalLink size={14} /> Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
