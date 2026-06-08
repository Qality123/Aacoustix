import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { api } from '../api/client';
import { SongRow } from '../components/SongRow';
import type { Song } from '../types';

export function Charts() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Song[]>('/songs?limit=20').then(res => setSongs(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;

  return (
    <div>
      <div className="entity-header" style={{ background: 'linear-gradient(135deg, #111111, #000000)' }}>
        <div className="entity-header-content">
          <div className="entity-image flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <BarChart3 size={32} className="sm:w-[64px] sm:h-[64px] text-accent" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2">Music</p>
            <h1 className="text-3xl sm:text-5xl font-bold mb-2">Charts</h1>
            <p className="text-text-secondary text-sm">Top 20 most played songs</p>
          </div>
        </div>
      </div>
      <div className="pt-2">
        <div className="flex flex-col">
          <div className="grid grid-cols-[40px_1fr_0px_52px_0px_80px] sm:grid-cols-[40px_1fr_1fr_52px_80px_80px] px-2 sm:px-4 py-2 text-text-secondary text-xs uppercase tracking-wider border-b border-surface-elevated mb-1">
            <span>#</span><span>Title</span><span className="hidden sm:block">Album</span><span/>
            <span className="hidden sm:block">Plays</span><span>Duration</span>
          </div>
          {songs.map((song, i) => <SongRow key={song.id} song={song} index={i} songs={songs} />)}
        </div>
      </div>
    </div>
  );
}
