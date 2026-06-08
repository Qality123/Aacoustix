import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListMusic, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { SongRow } from '../components/SongRow';
import { useAuth } from '../context/AuthContext';
import type { Playlist } from '../types';

export function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPlaylist = () => {
    api.get<Playlist>(`/playlists/${id}`)
      .then(res => setPlaylist(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlaylist(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await api.delete(`/playlists/${id}`);
      navigate('/playlists');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;
  if (!playlist) return <div className="flex items-center justify-center h-64 text-text-secondary">Playlist not found</div>;

  const isOwner = user?.id === playlist.userId;

  return (
    <div>
      <div className="entity-header" style={{ background: 'linear-gradient(135deg, #111111, #000000)' }}>
        <div className="entity-header-content">
          <div className="entity-image" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <ListMusic size={32} className="sm:w-[64px] sm:h-[64px] text-accent" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2">Playlist</p>
            <h1 className="text-3xl sm:text-5xl font-bold mb-2">{playlist.name}</h1>
            {playlist.description && <p className="text-text-secondary text-sm mb-1">{playlist.description}</p>}
            <p className="text-text-secondary text-sm">{playlist.songCount} songs</p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        {isOwner && (
          <div className="mb-6">
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-transparent text-text-secondary border border-text-subdued text-sm hover:text-text-primary hover:border-text-primary transition-colors">
              <Trash2 size={16} /> Delete Playlist
            </button>
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4">Songs</h2>
          {playlist.songs && playlist.songs.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-[40px_1fr_0px_52px_0px_80px] sm:grid-cols-[40px_1fr_1fr_52px_80px_80px] px-2 sm:px-4 py-2 text-text-secondary text-xs uppercase tracking-wider border-b border-surface-elevated mb-1">
                <span>#</span><span>Title</span><span className="hidden sm:block">Album</span><span/>
                <span className="hidden sm:block">Plays</span><span>Duration</span>
              </div>
              {playlist.songs.map((song, i) => (
                <SongRow key={song.id + i} song={song} index={i} songs={playlist.songs!} />
              ))}
            </div>
          ) : (
            <p className="text-text-secondary py-8">This playlist is empty. Browse songs to add some!</p>
          )}
        </section>
      </div>
    </div>
  );
}
