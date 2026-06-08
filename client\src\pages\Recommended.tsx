import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, Disc3 } from 'lucide-react';
import { api } from '../api/client';
import { SongRow } from '../components/SongRow';
import { ArtistAvatar } from '../components/ArtistAvatar';
import type { Song, Artist } from '../types';

const GENRES = ['Electronic', 'Jazz', 'Classical', 'Afrobeat', 'Synthwave'];

export function Recommended() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get<Song[]>('/songs?limit=10'),
      api.get<Artist[]>('/artists'),
    ]).then(([sRes, aRes]) => {
      setSongs(sRes.data);
      setArtists(aRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;

  return (
    <div>
      <div className="entity-header" style={{ background: 'linear-gradient(135deg, #111111, #000000)' }}>
        <div className="entity-header-content">
          <div className="entity-image flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ThumbsUp size={32} className="sm:w-[64px] sm:h-[64px] text-accent" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2">Buzz</p>
            <h1 className="text-3xl sm:text-5xl font-bold mb-2">Recommended</h1>
            <p className="text-text-secondary text-sm">Picked just for you</p>
          </div>
        </div>
      </div>
      <div className="pt-2 space-y-8">
        <section>
          <h2 className="text-lg font-bold mb-4">Recommended Songs</h2>
          <div className="flex flex-col">
            <div className="grid grid-cols-[40px_1fr_0px_52px_0px_80px] sm:grid-cols-[40px_1fr_1fr_52px_80px_80px] px-2 sm:px-4 py-2 text-text-secondary text-xs uppercase tracking-wider border-b border-surface-elevated mb-1">
              <span>#</span><span>Title</span><span className="hidden sm:block">Album</span><span/>
              <span className="hidden sm:block">Plays</span><span>Duration</span>
            </div>
            {songs.map((song, i) => <SongRow key={song.id} song={song} index={i} songs={songs} />)}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Artists You Might Like</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {artists.slice(0, 4).map(a => (
              <div key={a.id} className="bg-surface-secondary p-3 rounded-lg cursor-pointer hover:bg-surface-elevated transition-colors" onClick={() => navigate(`/artist/${a.id}`)}>
                <ArtistAvatar imageUrl={a.imageUrl} name={a.name} className="w-full aspect-square rounded-full mb-3" iconSize={36} />
                <div className="font-bold text-xs truncate text-center">{a.name}</div>
                <div className="text-text-secondary text-[11px] text-center">Artist</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Explore Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {GENRES.map(g => (
              <div key={g} onClick={() => navigate(`/genre/${g}`)}
                className="p-5 rounded-lg text-center font-semibold text-sm cursor-pointer transition-transform hover:scale-105"
                style={{ background: genreGradient(g) }}>
                <Disc3 size={24} className="mx-auto mb-2 opacity-80" />
                {g}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function genreGradient(genre: string): string {
  const g: Record<string, string> = {
    Electronic: 'linear-gradient(135deg, #555555, #333333)',
    Jazz: 'linear-gradient(135deg, #555555, #333333)',
    Classical: 'linear-gradient(135deg, #555555, #333333)',
    Afrobeat: 'linear-gradient(135deg, #555555, #333333)',
    Synthwave: 'linear-gradient(135deg, #555555, #333333)',
  };
  return g[genre] || 'linear-gradient(135deg, #333333, #111111)';
}
