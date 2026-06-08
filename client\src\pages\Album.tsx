import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { SongRow } from '../components/SongRow';
import { ArtistAvatar } from '../components/ArtistAvatar';
import type { Song } from '../types';

export function Album() {
  const { id } = useParams<{ id: string }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Song[]>('/songs?search=&limit=50')
      .then(res => {
        const albumSongs = res.data.filter(s => s.albumId === id);
        setSongs(albumSongs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;

  const album = songs[0];

  return (
    <div>
      <div className="entity-header" style={{ background: album?.coverUrl ? `url(${album.coverUrl})` : 'linear-gradient(135deg, #333333, #111111)' }}>
        <div className="entity-header-content">
          <div className="entity-image" style={{ background: album?.coverUrl ? `url(${album.coverUrl})` : '#333' }}>
            {!album?.coverUrl && '💿'}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2">Album</p>
            <h1 className="text-3xl sm:text-5xl font-bold mb-2">{album?.albumTitle || 'Album'}</h1>
            {album && (
              <p className="text-text-secondary text-sm flex items-center gap-2 justify-center sm:justify-start">
                <Link to={`/artist/${album.artistId}`} className="shrink-0">
                  <ArtistAvatar imageUrl={album.artistImageUrl} name={album.artistName} className="w-6 h-6 rounded-full" iconSize={12} />
                </Link>
                <Link to={`/artist/${album.artistId}`} className="hover:text-text-primary">{album.artistName}</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <section>
          <h2 className="text-xl font-bold mb-4">Songs</h2>
          {songs.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-[40px_1fr_0px_40px_0px_80px] sm:grid-cols-[40px_1fr_1fr_40px_80px_80px] px-2 sm:px-4 py-2 text-text-secondary text-xs uppercase tracking-wider border-b border-surface-elevated mb-1">
                <span>#</span><span>Title</span><span className="hidden sm:block"/>
                <span/>
                <span className="hidden sm:block">Plays</span><span>Duration</span>
              </div>
              {songs.map((song, i) => (
                <SongRow key={song.id} song={song} index={i} songs={songs} />
              ))}
            </div>
          ) : (
            <p className="text-text-secondary py-8">No songs found.</p>
          )}
        </section>
      </div>
    </div>
  );
}
