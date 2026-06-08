import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic2 } from 'lucide-react';
import { api } from '../api/client';
import { SongRow } from '../components/SongRow';
import { useAuth } from '../context/AuthContext';
import type { Artist as ArtistType } from '../types';

export function Artist() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistType | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get<ArtistType>(`/artists/${id}`)
      .then(res => setArtist(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    api.get<{ following: boolean }>(`/follows/check/${id}`)
      .then(res => setFollowing(res.data.following))
      .catch(() => {});
    api.get<{ count: number }>(`/follows/count/${id}`)
      .then(res => setFollowerCount(res.data.count))
      .catch(() => {});
  }, [id]);

  const toggleFollow = async () => {
    if (!user) { navigate('/login'); return; }
    setFollowLoading(true);
    try {
      if (following) {
        await api.delete(`/follows/${id}`);
        setFollowing(false);
        setFollowerCount(c => Math.max(0, c - 1));
      } else {
        await api.post(`/follows/${id}`, {});
        setFollowing(true);
        setFollowerCount(c => c + 1);
      }
    } catch {}
    setFollowLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;
  if (!artist) return <div className="flex items-center justify-center h-64 text-text-secondary">Artist not found</div>;

  return (
    <div>
      <div className="entity-header relative" style={{
        backgroundImage: artist.imageUrl ? `url(${artist.imageUrl})` : 'linear-gradient(135deg, #333333, #111111)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="entity-header-content relative z-10">
          <div className="shrink-0 w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] rounded-full border-4 border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex items-center justify-center bg-cover bg-center"
            style={artist.imageUrl ? { backgroundImage: `url(${artist.imageUrl})` } : { backgroundColor: '#333333' }}>
            {!artist.imageUrl && <Mic2 size={72} className="text-text-subdued" />}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2 opacity-80">Artist</p>
            <h1 className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg">{artist.name}</h1>
            <div className="flex items-center gap-3">
              {artist.genre && <p className="text-text-secondary text-sm">{artist.genre}</p>}
              <span className="text-text-subdued text-sm">&middot;</span>
              <p className="text-text-secondary text-sm">{followerCount} follower{followerCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="self-start mt-2">
            <button onClick={toggleFollow} disabled={followLoading}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                following
                  ? 'bg-surface-elevated text-text-primary hover:border hover:border-white hover:text-white'
                  : 'bg-accent text-white hover:bg-accent-hover'
              }`}>
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Popular Songs</h2>
          <div className="flex flex-col">
            <div className="grid grid-cols-[40px_1fr_0px_40px_0px_80px] sm:grid-cols-[40px_1fr_1fr_40px_80px_80px] px-2 sm:px-4 py-2 text-text-secondary text-xs uppercase tracking-wider border-b border-surface-elevated mb-1">
              <span>#</span><span>Title</span><span className="hidden sm:block"/>
              <span/>
              <span className="hidden sm:block">Plays</span><span>Duration</span>
            </div>
            {artist.topSongs?.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} songs={artist.topSongs} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
            {artist.albums?.map(album => (
              <div key={album.id} className="bg-surface-secondary p-4 rounded-lg cursor-pointer hover:bg-surface-elevated transition-colors" onClick={() => navigate(`/album/${album.id}`)}>
                <div className="w-full aspect-square rounded mb-4 flex items-center justify-center text-4xl bg-cover bg-center" style={{ background: album.coverUrl ? `url(${album.coverUrl})` : '#e0e0e0' }}>
                  {!album.coverUrl && '💿'}
                </div>
                <div className="font-bold text-sm truncate">{album.title}</div>
                <div className="text-text-secondary text-xs">{album.releaseYear}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
