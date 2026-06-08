import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Plus, Minus, Music, Mic2, BarChart3, Heart as HeartIcon, ListMusic, Disc3, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { usePlayer } from '../context/PlayerContext';
import { useLikedSongs } from '../hooks/useLikedSongs';
import { useAuth } from '../context/AuthContext';
import type { Song, Playlist, Artist } from '../types';

export function SongDetailPanel({ song, onClose, onViewArtist }: { song: Song; onClose: () => void; onViewArtist?: (artist: Artist) => void }) {
  const navigate = useNavigate();
  const { play } = usePlayer();
  const { isLiked, toggleLike } = useLikedSongs();
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addedMsg, setAddedMsg] = useState('');
  const [artistInfo, setArtistInfo] = useState<Artist | null>(null);
  const handleViewArtist = () => {
    if (artistInfo && onViewArtist) onViewArtist(artistInfo);
  };

  useEffect(() => {
    setArtistInfo(null);
    api.get<{ count: number }>(`/likes/count/${song.id}`)
      .then(res => setLikeCount(res.data.count))
      .catch(() => {});
    api.get<Playlist[]>('/playlists')
      .then(res => setPlaylists(res.data.filter(p => p.userId)))
      .catch(() => {});
    api.get<Artist>(`/artists/${song.artistId}`)
      .then(res => setArtistInfo(res.data))
      .catch(() => {});
  }, [song.id]);

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!user) { onClose(); navigate('/login'); return; }
    setAddingTo(playlistId);
    try {
      await api.post(`/playlists/${playlistId}/songs`, { songId: song.id });
      setAddedMsg('Added!');
      setTimeout(() => setAddedMsg(''), 2000);
    } catch {
      setAddedMsg('Already in playlist');
      setTimeout(() => setAddedMsg(''), 2000);
    } finally {
      setAddingTo(null);
    }
  };

  const handlePlay = () => {
    play(song);
  };

  const liked = isLiked(song.id);

  return (
    <div className="w-72 lg:w-80 bg-surface-secondary border-l border-surface-elevated overflow-y-auto shrink-0 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-elevated">
        <h3 className="text-sm font-semibold">Song Details</h3>
        <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary rounded transition">
          <X size={16} />
        </button>
      </div>

      <div className="w-full aspect-square rounded-lg bg-cover bg-center shadow-lg flex items-center justify-center overflow-hidden"
        style={{ background: song.coverUrl ? `url(${song.coverUrl})` : '#333' }}>
        {!song.coverUrl && <Music size={48} className="text-text-subdued" />}
      </div>

      <div className="p-4 space-y-4">

        <div className="space-y-1">
          <h2 className="text-lg font-bold truncate">{song.title}</h2>
          <p className="text-text-secondary text-sm flex items-center gap-1 truncate">
            <Mic2 size={13} />{song.artistName}
          </p>
          {song.albumTitle && (
            <p className="text-text-secondary text-xs flex items-center gap-1 truncate">
              <Disc3 size={11} />{song.albumTitle}
            </p>
          )}
        </div>

        {artistInfo && (
          <div className="bg-surface-elevated rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-3">
              {artistInfo.imageUrl ? (
                <img src={artistInfo.imageUrl} alt={artistInfo.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center"><Mic2 size={16} className="text-text-subdued" /></div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{artistInfo.name}</p>
                <p className="text-[10px] text-text-subdued">Artist</p>
              </div>
            </div>
            {artistInfo.bio && (
              <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{artistInfo.bio}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {artistInfo.genre && <span className="text-[10px] text-text-subdued bg-surface-secondary px-2 py-0.5 rounded">{artistInfo.genre}</span>}
              {artistInfo.country && <span className="text-[10px] text-text-subdued bg-surface-secondary px-2 py-0.5 rounded">{artistInfo.country}</span>}
              {artistInfo.recordLabel && <span className="text-[10px] text-text-subdued bg-surface-secondary px-2 py-0.5 rounded">{artistInfo.recordLabel}</span>}
            </div>
            <button onClick={handleViewArtist}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-semibold hover:brightness-110 transition">
              <ExternalLink size={12} /> View More
            </button>
          </div>
        )}

        {song.description && (
          <p className="text-text-secondary text-xs leading-relaxed">{song.description}</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <BarChart3 size={14} className="mx-auto mb-1 text-accent" />
            <div className="font-bold text-sm">{song.plays.toLocaleString()}</div>
            <div className="text-[10px] text-text-subdued">Plays</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <HeartIcon size={14} className="mx-auto mb-1 text-accent" />
            <div className="font-bold text-sm">{likeCount.toLocaleString()}</div>
            <div className="text-[10px] text-text-subdued">Likes</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <ListMusic size={14} className="mx-auto mb-1 text-accent" />
            <div className="font-bold text-sm">{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</div>
            <div className="text-[10px] text-text-subdued">Duration</div>
          </div>
        </div>

        {song.genre && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-surface-elevated text-text-secondary text-[10px]">{song.genre}</span>
        )}

        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition">
            <Play size={14} fill="currentColor" /> Play
          </button>
          <button onClick={() => { if (!user) { onClose(); navigate('/login'); return; } toggleLike(song.id); }} className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-highlight transition" title={liked ? 'Unlike' : 'Like'}>
            {liked ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>

      {playlists.length > 0 && (
        <div className="border-t border-surface-elevated px-4 py-4">
          <p className="text-xs text-text-secondary font-semibold mb-2 flex items-center gap-1.5"><Plus size={12} /> Add to Playlist</p>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {playlists.map(pl => (
              <button key={pl.id} onClick={() => handleAddToPlaylist(pl.id)} disabled={addingTo === pl.id}
                className="px-3 py-1.5 rounded-full bg-surface-elevated text-text-secondary text-xs hover:bg-surface-highlight hover:text-text-primary transition disabled:opacity-50 flex items-center gap-1">
                {addingTo === pl.id ? <span className="animate-spin">⟳</span> : <Plus size={10} />}
                {pl.name}
              </button>
            ))}
            {addedMsg && <span className="text-accent text-xs ml-1 self-center font-semibold">{addedMsg}</span>}
          </div>
        </div>
      )}

    </div>
  );
}
