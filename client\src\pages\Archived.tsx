import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SongRow } from '../components/SongRow';
import { Archive, Music } from 'lucide-react';
import type { Song } from '../types';

export function Archived() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Song[]>('/songs?search=&limit=100')
      .then(res => setSongs(res.data.filter(s => s.status === 'archived')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="entity-header" style={{ background: 'linear-gradient(135deg, #444444, #222222)' }}>
        <div className="entity-header-content">
          <div className="w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] rounded-full flex items-center justify-center text-4xl sm:text-6xl bg-cover bg-center shadow-[0_4px_60px_rgba(0,0,0,0.5)] shrink-0 bg-surface-elevated">
            <Archive size={48} className="text-text-subdued" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2">Buzz</p>
            <h1 className="text-3xl sm:text-5xl font-bold mb-2">Archived</h1>
            <p className="text-text-secondary text-sm">{songs.length} archived song{songs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        {songs.length > 0 ? (
          <div className="flex flex-col">
            <div className="grid grid-cols-[40px_1fr_0px_40px_0px_80px] sm:grid-cols-[40px_1fr_1fr_40px_80px_80px] px-2 sm:px-4 py-2 text-text-secondary text-xs uppercase tracking-wider border-b border-surface-elevated mb-1">
              <span>#</span><span>Title</span><span className="hidden sm:block" />
              <span />
              <span className="hidden sm:block">Plays</span><span>Duration</span>
            </div>
            {songs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} songs={songs} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <Music size={48} className="mb-4 text-text-subdued" />
            <p className="text-lg font-semibold">No archived songs</p>
            <p className="text-sm">Archived songs will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
