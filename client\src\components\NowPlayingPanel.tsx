import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic2, Music, BarChart3, Heart, ListMusic, Disc3 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { api } from '../api/client';
import { ArtistAvatar } from './ArtistAvatar';
import type { Artist } from '../types';

export function NowPlayingPanel({ onClose }: { onClose: () => void }) {
  const { currentSong } = usePlayer();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (!currentSong) return;
    api.get<{ count: number }>(`/likes/count/${currentSong.id}`)
      .then(res => setLikeCount(res.data.count))
      .catch(() => {});
    api.get<Artist>(`/artists/${currentSong.artistId}`)
      .then(res => setArtist(res.data))
      .catch(() => {});
  }, [currentSong]);

  if (!currentSong) return null;

  return (
    <div className="w-72 lg:w-80 bg-surface-secondary border-l border-surface-elevated overflow-y-auto shrink-0 flex flex-col">
      <div className="px-4 py-3 border-b border-surface-elevated">
        <h3 className="text-sm font-semibold">Now Playing</h3>
      </div>

      <div className="w-full aspect-square rounded-lg shadow-lg overflow-hidden bg-surface-elevated">
        {currentSong.coverUrl ? (
          <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#333]">
            <Music size={48} className="text-text-subdued" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">

        <div>
          <h2 className="text-lg font-bold truncate">{currentSong.title}</h2>
          <button onClick={() => { navigate(`/artist/${currentSong.artistId}`); onClose(); }}
            className="text-text-secondary text-sm hover:text-text-primary truncate flex items-center gap-1 mt-0.5">
            <Mic2 size={13} />{currentSong.artistName}
          </button>
          {currentSong.albumTitle && (
            <button onClick={() => { navigate(`/album/${currentSong.albumId}`); onClose(); }}
              className="text-text-secondary text-xs hover:text-text-primary truncate flex items-center gap-1 mt-0.5">
              <Disc3 size={11} />{currentSong.albumTitle}
            </button>
          )}
        </div>

        {currentSong.description && (
          <p className="text-text-secondary text-xs leading-relaxed">{currentSong.description}</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <BarChart3 size={14} className="mx-auto mb-1 text-accent" />
            <div className="font-bold text-sm">{currentSong.plays.toLocaleString()}</div>
            <div className="text-[10px] text-text-subdued">Plays</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <Heart size={14} className="mx-auto mb-1 text-accent" />
            <div className="font-bold text-sm">{likeCount.toLocaleString()}</div>
            <div className="text-[10px] text-text-subdued">Likes</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <ListMusic size={14} className="mx-auto mb-1 text-accent" />
            <div className="font-bold text-sm">{Math.floor(currentSong.duration / 60)}:{(currentSong.duration % 60).toString().padStart(2, '0')}</div>
            <div className="text-[10px] text-text-subdued">Duration</div>
          </div>
        </div>

        {currentSong.genre && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-surface-elevated text-text-secondary text-[10px]">{currentSong.genre}</span>
        )}
      </div>

      {artist && (
        <div className="border-t border-surface-elevated p-4 space-y-3">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">About the Artist</h4>
          <div className="flex items-center gap-3">
            <ArtistAvatar imageUrl={artist.imageUrl} name={artist.name} className="w-12 h-12 rounded-full shrink-0 bg-surface-elevated" iconSize={18} />
            <div className="min-w-0">
              <button onClick={() => { navigate(`/artist/${artist.id}`); onClose(); }}
                className="font-semibold text-sm hover:text-red-300 truncate block">
                {artist.name}
              </button>
              {artist.genre && <p className="text-text-secondary text-xs">{artist.genre}</p>}
            </div>
          </div>
          {artist.bio && (
            <p className="text-text-secondary text-xs leading-relaxed line-clamp-3">{artist.bio}</p>
          )}
        </div>
      )}
    </div>
  );
}
