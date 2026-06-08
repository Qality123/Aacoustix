import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ListMusic, TrendingUp, Album, Disc3, Clock, Mic2 } from 'lucide-react';
import { Play } from 'lucide-react';
import { api } from '../api/client';
import { SongRow } from '../components/SongRow';
import { ArtistAvatar } from '../components/ArtistAvatar';
import { usePlayer } from '../context/PlayerContext';
import type { Song, Artist, Album as AlbumType, Playlist } from '../types';

function SongCard({ song, songs }: { song: Song; songs: Song[] }) {
  const { play, playQueue } = usePlayer();
  const navigate = useNavigate();

  return (
    <div
      className="group bg-gray-900 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors w-44 shrink-0"
      onClick={() => {
        if (songs.length > 1) {
          const idx = songs.findIndex(s => s.id === song.id);
          playQueue(songs, idx >= 0 ? idx : 0);
        } else {
          play(song);
        }
      }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded mb-3 overflow-hidden bg-gray-800">
        {song.coverUrl ? (
          <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-gray-500">
            <Disc3 size={32} />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-accent shadow-lg flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <Play size={18} className="text-white ml-0.5" fill="currentColor" />
        </div>
      </div>

      {/* Song Info */}
      <div className="font-bold text-sm truncate text-white">{song.title}</div>
      <div
        className="text-gray-400 text-xs truncate hover:underline cursor-pointer"
        onClick={e => { e.stopPropagation(); navigate(`/artist/${song.artistId}`); }}
      >
        {song.artistName}
      </div>
    </div>
  );
}

export function Home() {
  const [songsForYou, setSongsForYou] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [mixes, setMixes] = useState<Song[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Song[]>([]);
  const [accounts, setAccounts] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get<Song[]>('/songs?limit=8'),
      api.get<Playlist[]>('/playlists'),
      api.get<Song[]>('/songs?limit=10'),
      api.get<AlbumType[]>('/albums'),
      api.get<Song[]>('/songs?limit=8&page=2'),
      api.get<Song[]>('/songs?sort=createdAt&limit=8'),
      api.get<Artist[]>('/artists'),
    ]).then(([
      songsForYouRes, playlistsRes, trendingRes,
      albumsRes, mixesRes, recentlyAddedRes, accountsRes,
    ]) => {
      setSongsForYou(songsForYouRes.data);
      setPlaylists(playlistsRes.data.filter(p => p.isPublic || true));
      setTrending(trendingRes.data);
      setAlbums(albumsRes.data);
      setMixes(mixesRes.data);
      setRecentlyAdded(recentlyAddedRes.data);
      setAccounts(accountsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="text-white">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6 text-white">Good evening</h1>

      {/* Songs for You Section */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4 text-white">
          <Sparkles size={22} /> Songs for you
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {songsForYou.map(song => (
            <SongCard key={song.id} song={song} songs={songsForYou} />
          ))}
        </div>
      </section>

      {/* Playlists Section */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4 text-white">
          <ListMusic size={22} /> Playlist for you
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {playlists.map(pl => (
            <div
              key={pl.id}
              className="group bg-gray-900 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors w-44 shrink-0"
              onClick={() => navigate(`/playlist/${pl.id}`)}
            >
              {/* Playlist Cover */}
              <div
                className="w-full aspect-square rounded mb-3 flex items-center justify-center text-4xl bg-cover bg-center"
                style={{ background: pl.coverUrl ? `url(${pl.coverUrl})` : 'linear-gradient(135deg, #374151, #1f2937)' }}
              >
                {!pl.coverUrl && <ListMusic size={32} className="text-gray-500" />}
              </div>
              
              {/* Playlist Info */}
              <div className="font-bold text-sm truncate text-white">{pl.name}</div>
              <div className="text-gray-400 text-xs">{pl.songCount} songs</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Songs Section */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4 text-white">
          <TrendingUp size={22} /> Trending Songs
        </h2>
        
        {/* Table Header */}
        <div className="flex flex-col">
          <div className="grid grid-cols-[40px_1fr_0px_52px_0px_80px] sm:grid-cols-[40px_1fr_1fr_52px_80px_80px] px-2 sm:px-4 py-2 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800 mb-1">
            <span>#</span>
            <span>Title</span>
            <span className="hidden sm:block">Album</span>
            <span/>
            <span className="hidden sm:block">Plays</span>
            <span>Duration</span>
          </div>
          
          {/* Song Rows */}
          {trending.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} songs={trending} />
          ))}
        </div>
      </section>

      {/* Trending Albums Section */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4 text-white">
          <Album size={22} /> Trending Albums
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {albums.map(album => (
            <div
              key={album.id}
              className="group bg-gray-900 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors w-44 shrink-0"
              onClick={() => navigate(`/album/${album.id}`)}
            >
              {/* Album Cover */}
              <div
                className="w-full aspect-square rounded mb-3 flex items-center justify-center text-4xl bg-cover bg-center"
                style={{ background: album.coverUrl ? `url(${album.coverUrl})` : '#374151' }}
              >
                {!album.coverUrl && <Album size={32} className="text-gray-500" />}
              </div>
              
              {/* Album Info */}
              <div className="font-bold text-sm truncate text-white">{album.title}</div>
              <div className="text-gray-400 text-xs truncate">{album.artistName || album.releaseYear}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mixes for You Section */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4 text-white">
          <Disc3 size={22} /> Mixes for you
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {mixes.map(song => (
            <SongCard key={song.id} song={song} songs={mixes} />
          ))}
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4 text-white">
          <Clock size={22} /> Recently Added
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {recentlyAdded.map(song => (
            <SongCard key={song.id} song={song} songs={recentlyAdded} />
          ))}
        </div>
      </section>

      {/* Artists Section */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4 text-white">
          <Mic2 size={22} /> Accounts for you
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {accounts.slice(0, 8).map(artist => (
            <div
              key={artist.id}
              className="group bg-gray-900 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors w-44 shrink-0"
              onClick={() => navigate(`/artist/${artist.id}`)}
            >
              {/* Artist Avatar */}
              <ArtistAvatar
                imageUrl={artist.imageUrl}
                name={artist.name}
                className="w-full aspect-square rounded-full mb-3"
                iconSize={40}
              />
              
              {/* Artist Info */}
              <div className="font-bold text-sm truncate text-center text-white">{artist.name}</div>
              <div className="text-gray-400 text-xs text-center">Artist</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}