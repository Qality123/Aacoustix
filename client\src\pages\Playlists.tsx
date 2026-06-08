import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ListMusic } from 'lucide-react';
import { api } from '../api/client';
import type { Playlist } from '../types';

export function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Playlist[]>('/playlists')
      .then(res => setPlaylists(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createPlaylist = () => {
    const name = prompt('Playlist name:');
    if (name) {
      api.post<Playlist>('/playlists', { name, isPublic: true })
        .then(res => navigate(`/playlist/${res.data.id}`))
        .catch(console.error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <button onClick={createPlaylist} className="flex items-center gap-2 px-6 py-2 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-transform hover:scale-[1.02]">
          <Plus size={18} /> New Playlist
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
        {playlists.map(pl => (
          <div key={pl.id} className="bg-surface-secondary p-4 rounded-lg cursor-pointer hover:bg-surface-elevated transition-colors" onClick={() => navigate(`/playlist/${pl.id}`)}>
            <div className="w-full aspect-square rounded mb-4 flex items-center justify-center text-4xl bg-cover bg-center" style={{ background: pl.coverUrl ? `url(${pl.coverUrl})` : 'linear-gradient(135deg, #333333, #111111)' }}>
              <ListMusic size={40} />
            </div>
            <div className="font-bold text-sm truncate">{pl.name}</div>
            <div className="text-text-secondary text-xs">{pl.songCount} songs</div>
          </div>
        ))}
        {playlists.length === 0 && <p className="text-text-secondary py-8 col-span-full">No playlists yet. Create one!</p>}
      </div>
    </div>
  );
}
