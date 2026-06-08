import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListMusic } from 'lucide-react';
import { api } from '../api/client';
import { ArtistAvatar } from '../components/ArtistAvatar';
import { SongRow } from '../components/SongRow';
import type { Song, Artist, Playlist } from '../types';

export function Library() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tab, setTab] = useState<'songs' | 'artists' | 'playlists'>('songs');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get<Song[]>('/songs?limit=20'),
      api.get<Artist[]>('/artists'),
      api.get<Playlist[]>('/playlists'),
    ]).then(([songsRes, artistsRes, plRes]) => {
      setSongs(songsRes.data);
      setArtists(artistsRes.data);
      setPlaylists(plRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Library</h1>

      <div className="flex gap-3 mb-6">
        {(['songs', 'artists', 'playlists'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === t ? 'bg-red-400 text-white' : 'bg-surface-elevated text-text-primary hover:bg-surface-highlight'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'songs' && (
        <div className="flex flex-col">
          <div className="grid grid-cols-[40px_1fr_0px_52px_0px_80px] sm:grid-cols-[40px_1fr_1fr_52px_80px_80px] px-2 sm:px-4 py-2 text-text-secondary text-xs uppercase tracking-wider border-b border-surface-elevated mb-1">
            <span>#</span><span>Title</span><span className="hidden sm:block">Album</span><span/>
            <span className="hidden sm:block">Plays</span><span>Duration</span>
          </div>

          {songs.slice(0, 10).map((song, i) => (
            <SongRow key={song.id} song={song} index={i} songs={songs.slice(0, 10)} />
          ))}
        </div>
      )}

      {tab === 'artists' && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
          {artists.map(a => (
            <div key={a.id} className="bg-surface-secondary p-4 rounded-lg cursor-pointer hover:bg-surface-elevated transition-colors" onClick={() => navigate(`/artist/${a.id}`)}>
              <ArtistAvatar imageUrl={a.imageUrl} name={a.name} className="w-full aspect-square rounded-full mb-4" iconSize={48} />
              <div className="font-bold text-sm truncate">{a.name}</div>
              <div className="text-text-secondary text-xs">Artist</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'playlists' && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
          {playlists.map(pl => (
            <div key={pl.id} className="bg-surface-secondary p-4 rounded-lg cursor-pointer hover:bg-surface-elevated transition-colors" onClick={() => navigate(`/playlist/${pl.id}`)}>
              <div className="w-full aspect-square rounded mb-4 flex items-center justify-center text-4xl bg-cover bg-center" style={{ background: 'linear-gradient(135deg, #333333, #111111)' }}>
                <ListMusic size={40} />
              </div>
              <div className="font-bold text-sm truncate">{pl.name}</div>
              <div className="text-text-secondary text-xs">{pl.songCount} songs</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
