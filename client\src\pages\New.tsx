import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { ArtistAvatar } from '../components/ArtistAvatar';
import type { Artist } from '../types';

export function New() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Artist[]>('/artists').then(res => setArtists(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;

  return (
    <div>
      <div className="entity-header" style={{ background: 'linear-gradient(135deg, #111111, #000000)' }}>
        <div className="entity-header-content">
          <div className="entity-image flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Sparkles size={32} className="sm:w-[64px] sm:h-[64px] text-accent" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2">Music</p>
            <h1 className="text-3xl sm:text-5xl font-bold mb-2">New Releases</h1>
            <p className="text-text-secondary text-sm">Fresh music and artists</p>
          </div>
        </div>
      </div>
      <div className="pt-2">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
          {artists.map(a => (
            <div key={a.id} className="bg-surface-secondary p-4 rounded-lg cursor-pointer hover:bg-surface-elevated transition-colors" onClick={() => navigate(`/artist/${a.id}`)}>
              <ArtistAvatar imageUrl={a.imageUrl} name={a.name} className="w-full aspect-square rounded-full mb-4" iconSize={48} />
              <div className="font-bold text-sm truncate text-center">{a.name}</div>
              <div className="text-text-secondary text-xs text-center">{a.genre || 'Artist'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
