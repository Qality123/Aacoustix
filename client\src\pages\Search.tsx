import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Disc3, Mic2, Music } from 'lucide-react';
import { api } from '../api/client';
import { SongRow } from '../components/SongRow';
import { ArtistAvatar } from '../components/ArtistAvatar';
import type { Song, Artist } from '../types';

const GENRES = ['Electronic', 'Jazz', 'Classical', 'Afrobeat', 'Synthwave'];

export function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Artist[]>('/artists').then(res => setAllArtists(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query) { setSongs([]); setArtists([]); return; }
    setLoading(true);
    Promise.all([
      api.get<Song[]>(`/songs?search=${encodeURIComponent(query)}&limit=20`),
      api.get<Artist[]>(`/artists?search=${encodeURIComponent(query)}`),
    ]).then(([songsRes, artistsRes]) => {
      setSongs(songsRes.data);
      setArtists(artistsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [query]);

  if (!query) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Discover</h1>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Browse by Genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {GENRES.map(g => (
              <div key={g} onClick={() => navigate(`/genre/${g}`)}
                className="p-5 rounded-lg text-center font-semibold text-sm cursor-pointer transition-transform hover:scale-105"
                style={{ background: genreGradient(g) }}>
                <Disc3 size={28} className="mx-auto mb-2 opacity-80" />
                {g}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Popular Artists</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
            {allArtists.slice(0, 6).map(a => (
              <div key={a.id} className="bg-surface-secondary p-3 rounded-lg cursor-pointer hover:bg-surface-elevated transition-colors" onClick={() => navigate(`/artist/${a.id}`)}>
                <ArtistAvatar imageUrl={a.imageUrl} name={a.name} className="w-full aspect-square rounded-full mb-3" iconSize={36} />
                <div className="font-bold text-xs truncate text-center">{a.name}</div>
                <div className="text-text-secondary text-[11px] text-center">Artist</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Results for "{query}"</h1>
      {loading ? (
        <p className="text-text-secondary">Searching...</p>
      ) : (
        <div className="space-y-8">
          {artists.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Mic2 size={18} /> Artists
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                {artists.map(a => (
                  <div key={a.id} onClick={() => navigate(`/artist/${a.id}`)}
                    className="bg-surface-secondary p-3 rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors">
                    <ArtistAvatar imageUrl={a.imageUrl} name={a.name} className="w-full aspect-square rounded-full mb-3" iconSize={28} />
                    <div className="font-bold text-xs truncate text-center">{a.name}</div>
                    <div className="text-text-secondary text-[11px] text-center">{a.genre || 'Artist'}</div>
                    {a.bio && <div className="text-text-subdued text-[10px] text-center mt-1 line-clamp-2">{a.bio}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {songs.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Music size={18} /> Songs
              </h2>
              <div className="grid grid-cols-[40px_1fr_0px_40px_0px_80px] sm:grid-cols-[40px_1fr_1fr_40px_80px_80px] px-2 sm:px-4 py-2 text-text-secondary text-xs uppercase tracking-wider border-b border-surface-elevated mb-1">
                <span>#</span><span>Title / Artist</span><span className="hidden sm:block">Album</span><span/>
                <span className="hidden sm:block">Plays</span><span>Duration</span>
              </div>
              {songs.map((song, i) => (
                <SongRow key={song.id} song={song} index={i} songs={songs} />
              ))}
            </section>
          )}

          {artists.length === 0 && songs.length === 0 && (
            <p className="text-text-secondary py-8">No results for "{query}". Try something else.</p>
          )}
        </div>
      )}
    </div>
  );
}

function genreGradient(genre: string): string {
  const gradients: Record<string, string> = {
    Electronic: 'linear-gradient(135deg, #555555, #333333)',
    Jazz: 'linear-gradient(135deg, #555555, #333333)',
    Classical: 'linear-gradient(135deg, #555555, #333333)',
    Afrobeat: 'linear-gradient(135deg, #555555, #333333)',
    Synthwave: 'linear-gradient(135deg, #555555, #333333)',
  };
  return gradients[genre] || 'linear-gradient(135deg, #333333, #111111)';
}
