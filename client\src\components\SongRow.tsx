import { useState, useRef, useEffect } from 'react';
import { Play, Plus, Minus, ListMusic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Song, Playlist } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useLikedSongs } from '../hooks/useLikedSongs';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SongRow({ song, index, songs }: { song: Song; index?: number; songs?: Song[] }) {
  const { play, playQueue, currentSong } = usePlayer();
  const { isLiked, toggleLike } = useLikedSongs();
  const { user } = useAuth();
  const isActive = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  const navigate = useNavigate();

  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPlaylists(false);
      }
    }
    if (showPlaylists) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlaylists]);

  const handleTogglePlaylists = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (!showPlaylists && playlists.length === 0) {
      api.get<Playlist[]>('/playlists')
        .then(res => setPlaylists(res.data.filter(p => p.userId)))
        .catch(() => {});
    }
    setShowPlaylists(prev => !prev);
  };

  const handleAddToPlaylist = async (playlistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingTo(playlistId);
    try {
      await api.post(`/playlists/${playlistId}/songs`, { songId: song.id });
      setTimeout(() => setShowPlaylists(false), 500);
    } catch {
      // silently fail; song probably already in playlist
    } finally {
      setAddingTo(null);
    }
  };

  const handlePlay = () => {
    if (songs && songs.length > 1 && index !== undefined) {
      playQueue(songs, index);
    } else {
      play(song);
    }
  };

  return (
    <div
      className={`grid grid-cols-[40px_1fr_0px_52px_0px_80px] sm:grid-cols-[40px_1fr_1fr_52px_80px_80px] items-center px-2 sm:px-4 py-2 rounded cursor-pointer transition-colors group relative ${isActive ? 'bg-surface-highlight' : 'hover:bg-surface-elevated'}`}
      onClick={handlePlay}
    >
      <div className="text-text-secondary text-xs sm:text-sm text-center relative">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded flex items-center justify-center bg-cover bg-center shrink-0 mx-auto" style={{ background: song.coverUrl ? `url(${song.coverUrl})` : '#333' }}>
          <span className="group-hover:hidden">{!song.coverUrl ? (index !== undefined ? index + 1 : '♫') : ''}</span>
          <span className="hidden group-hover:inline-flex text-accent"><Play size={12} className="sm:w-[14px] sm:h-[14px]" fill="currentColor" /></span>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className={`text-sm sm:text-base font-medium truncate ${isActive ? 'text-accent' : ''}`}>{song.title}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <button onClick={e => { e.stopPropagation(); navigate(`/artist/${song.artistId}`); }} className="shrink-0 w-5 h-5 rounded-full overflow-hidden bg-surface-elevated">
            {song.artistImageUrl ? (
              <img src={song.artistImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-[10px] font-bold text-text-subdued">
                {song.artistName?.[0] || '?'}
              </span>
            )}
          </button>
          <span className="text-text-secondary text-xs sm:text-sm truncate">
            {song.artistName}
            {song.description && <span className="text-text-subdued"> — {song.description}</span>}
          </span>
        </div>
      </div>
      <div className="text-text-secondary text-sm truncate hidden sm:block">{song.albumTitle}</div>
      <div className="flex items-center justify-center gap-0.5 relative">
        <button
          onClick={e => { e.stopPropagation(); if (!user) { navigate('/login'); return; } toggleLike(song.id); }}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-text-subdued hover:text-text-secondary hover:bg-surface-elevated transition-colors"
          title={liked ? 'Unlike' : 'Like'}
        >
          {liked ? <Minus size={10} className="sm:w-[12px] sm:h-[12px]" /> : <Plus size={10} className="sm:w-[12px] sm:h-[12px]" />}
        </button>
        <button
          onClick={handleTogglePlaylists}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-text-subdued hover:text-text-secondary hover:bg-surface-elevated transition-colors"
          title="Add to Playlist"
        >
          <ListMusic size={10} className="sm:w-[12px] sm:h-[12px]" />
        </button>
        {showPlaylists && (
          <div ref={dropdownRef} onClick={e => e.stopPropagation()}
            className="absolute top-full right-0 mt-1 z-50 bg-surface-secondary border border-surface-elevated rounded-lg shadow-xl py-1 min-w-[160px] max-h-48 overflow-y-auto">
            {playlists.length === 0 ? (
              <p className="px-3 py-2 text-xs text-text-subdued">No playlists yet</p>
            ) : (
              playlists.map(pl => (
                <button key={pl.id} onClick={e => handleAddToPlaylist(pl.id, e)} disabled={addingTo === pl.id}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-text-secondary hover:bg-surface-highlight hover:text-text-primary transition disabled:opacity-50">
                  {addingTo === pl.id ? (
                    <span className="w-3 h-3 border border-text-subdued border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus size={10} className="shrink-0" />
                  )}
                  <span className="truncate">{pl.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div className="text-text-secondary text-sm hidden sm:block">{song.plays.toLocaleString()}</div>
      <div className="text-text-secondary text-sm text-right">{formatTime(song.duration)}</div>
    </div>
  );
}
