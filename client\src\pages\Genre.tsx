import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Disc3 } from 'lucide-react';
import { api } from '../api/client';
import { SongRow } from '../components/SongRow';
import type { Song } from '../types';

const genreGradients: Record<string, string> = {
  Electronic: 'linear-gradient(135deg, #555555, #333333)',
  Jazz: 'linear-gradient(135deg, #555555, #333333)',
  Classical: 'linear-gradient(135deg, #555555, #333333)',
  Afrobeat: 'linear-gradient(135deg, #555555, #333333)',
  Synthwave: 'linear-gradient(135deg, #555555, #333333)',
};

export function Genre() {
  const { name } = useParams<{ name: string }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) return;
    api.get<Song[]>(`/songs?genre=${encodeURIComponent(name)}&limit=50`)
      .then(res => setSongs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;
  if (!name) return null;

  const gradient = genreGradients[name] || 'linear-gradient(135deg, #333333, #111111)';

  return (
    <div>
      <div className="entity-header" style={{ background: gradient }}>
        <div className="entity-header-content">
          <div className="entity-image flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Disc3 size={32} className="sm:w-[64px] sm:h-[64px]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2">Genre</p>
            <h1 className="text-3xl sm:text-5xl font-bold mb-2">{name}</h1>
            <p className="text-text-secondary text-sm">{songs.length} songs</p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <section>
          <h2 className="text-xl font-bold mb-4">Songs</h2>
          {songs.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-[40px_1fr_0px_52px_0px_80px] sm:grid-cols-[40px_1fr_1fr_52px_80px_80px] px-2 sm:px-4 py-2 text-text-secondary text-xs uppercase tracking-wider border-b border-surface-elevated mb-1">
                <span>#</span><span>Title</span><span className="hidden sm:block">Album</span><span/>
                <span className="hidden sm:block">Plays</span><span>Duration</span>
              </div>
              {songs.map((song, i) => (
                <SongRow key={song.id} song={song} index={i} songs={songs} />
              ))}
            </div>
          ) : (
            <p className="text-text-secondary py-8">No songs found in this genre.</p>
          )}
        </section>
      </div>
    </div>
  );
}
