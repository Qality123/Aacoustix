import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic2, ArrowLeft, Plus, Upload, Disc3, Music, Edit3, Trash2, X, TrendingUp, Play } from 'lucide-react';
import { api } from '../api/client';
import { ArtistAvatar } from '../components/ArtistAvatar';
import { RedirectLoader } from '../components/RedirectLoader';
import type { ArtistDashboard, Album, Song, SongStatus, ArtistReport } from '../types';

export function ArtistDashboardPage() {
  const [dash, setDash] = useState<ArtistDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState('');
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [statusFilter, setStatusFilter] = useState<SongStatus | 'all'>('all');
  const [report, setReport] = useState<ArtistReport | null>(null);
  const [reportPeriod, setReportPeriod] = useState('7d');
  const [reportLoading, setReportLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = () => {
    setLoading(true);
    api.get<ArtistDashboard>('/artists/me')
      .then(res => { setDash(res.data); setError(''); })
      .catch(err => { setError(err.message); setDash(null); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchDashboard, []);

  const fetchReport = (period: string) => {
    setReportPeriod(period);
    setReportLoading(true);
    api.get<ArtistReport>(`/artists/report?period=${period}`)
      .then(res => setReport(res.data))
      .catch(() => setReport(null))
      .finally(() => setReportLoading(false));
  };

  useEffect(() => {
    if (dash) fetchReport('7d');
  }, [dash]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dash) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-surface-secondary p-10 rounded-xl max-w-md w-full text-center">
          <Mic2 size={48} className="mx-auto mb-4 text-text-subdued" />
          <h2 className="text-xl font-bold mb-2">Not an artist yet</h2>
          <p className="text-text-secondary text-sm mb-6">Create your artist profile to start uploading music.</p>
          <button onClick={() => navigate('/become-artist')} className="px-6 py-2 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover transition">
            Become an Artist
          </button>
        </div>
      </div>
    );
  }

  const totalPlays = dash.songs.reduce((sum, s) => sum + (s.plays || 0), 0);
  const statusCounts = { all: dash.songs.length, draft: 0, published: 0, archived: 0 };
  dash.songs.forEach(s => { if (s.status in statusCounts) statusCounts[s.status]++; });
  const filteredSongs = statusFilter === 'all' ? dash.songs : dash.songs.filter(s => s.status === statusFilter);

  return (
    <div className="max-w-4xl mx-auto pt-8 space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm mb-2 transition">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-gradient-to-r from-accent/20 to-surface-secondary rounded-xl p-6 flex items-center gap-5">
        <ArtistAvatar imageUrl={dash.imageUrl} name={dash.name} className="w-20 h-20 rounded-full shrink-0" iconSize={36} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-secondary uppercase tracking-widest">Artist Dashboard</p>
          <h1 className="text-2xl font-bold truncate">{dash.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
            {dash.genre && <span>{dash.genre}</span>}
            <span>✦ {dash.albums.length} album{dash.albums.length !== 1 ? 's' : ''}</span>
            <span>✦ {dash.songs.length} song{dash.songs.length !== 1 ? 's' : ''}</span>
            <span>✦ {totalPlays} play{totalPlays !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-text-subdued">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> {statusCounts.published} published</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> {statusCounts.draft} draft</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-500" /> {statusCounts.archived} archived</span>
          </div>
        </div>
      </div>

      <section className="bg-surface-secondary rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><TrendingUp size={18} /> Report</h2>
          <select value={reportPeriod} onChange={e => fetchReport(e.target.value)}
            className="bg-surface-elevated text-text-primary text-sm rounded-lg px-3 py-1.5 outline-none focus:outline-2 focus:outline-accent cursor-pointer">
            <option value="7d">Past Week</option>
            <option value="30d">Past Month</option>
            <option value="180d">Past 6 Months</option>
            <option value="365d">Past Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        {reportLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : report ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-surface-elevated rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{report.totalPlays.toLocaleString()}</div>
                <div className="text-xs text-text-secondary">Total Plays</div>
              </div>
              <div className="bg-surface-elevated rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-accent">{report.totalPeriodLikes}</div>
                <div className="text-xs text-text-secondary">New Likes</div>
              </div>
              <div className="bg-surface-elevated rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-accent">{report.songsCreated}</div>
                <div className="text-xs text-text-secondary">Songs Created</div>
              </div>
              <div className="bg-surface-elevated rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{report.totalSongs}</div>
                <div className="text-xs text-text-secondary">Total Songs</div>
              </div>
            </div>
            {report.topSongs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Top Songs (by plays)</h3>
                <div className="space-y-1">
                  {report.topSongs.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded bg-surface-elevated text-sm">
                      <span className="text-xs text-text-subdued w-4">{i + 1}</span>
                      <span className="flex-1 truncate font-medium">{s.title}</span>
                      <span className="text-xs text-text-secondary">{s.plays} plays</span>
                      <span className="text-xs text-accent">{s.periodLikes} likes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-text-secondary text-sm">Could not load report.</div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Disc3 size={18} /> My Albums</h2>
          <button onClick={() => setShowAlbumForm(!showAlbumForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition">
            <Plus size={14} /> {showAlbumForm ? 'Cancel' : 'Create Album'}
          </button>
        </div>

        {showAlbumForm && (
          <CreateAlbumForm onDone={() => { setShowAlbumForm(false); fetchDashboard(); }} />
        )}

        {dash.albums.length === 0 ? (
          <div className="bg-surface-secondary rounded-xl p-8 text-center text-text-secondary text-sm">
            <Disc3 size={32} className="mx-auto mb-2 text-text-subdued" />
            No albums yet. Create your first album!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {dash.albums.map(album => (
              editingAlbum?.id === album.id ? (
                <InlineAlbumEdit key={album.id} album={album} onDone={() => { setEditingAlbum(null); fetchDashboard(); }} onCancel={() => setEditingAlbum(null)} />
              ) : (
                <div key={album.id}
                  className="bg-surface-secondary rounded-lg p-3 text-left hover:bg-surface-highlight transition group relative">
                  <div className="absolute top-2 right-2 z-10 hidden group-hover:flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingAlbum(album); }}
                      className="p-1.5 rounded-full bg-black/60 text-text-secondary hover:text-text-primary hover:bg-black/80 transition" title="Edit">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={async (e) => { e.stopPropagation(); if (!confirm(`Delete album "${album.title}" and all its songs?`)) return; try { await api.delete(`/albums/${album.id}`); fetchDashboard(); } catch {} }}
                      className="p-1.5 rounded-full bg-black/60 text-text-secondary hover:text-white hover:bg-black/80 transition" title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <button onClick={() => navigate(`/album/${album.id}`)} className="w-full text-left">
                    <div className="aspect-square rounded bg-surface-elevated mb-2 overflow-hidden">
                      {album.coverUrl ? (
                        <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-subdued">
                          <Disc3 size={32} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold truncate">{album.title}</p>
                    <p className="text-xs text-text-secondary">{album.releaseYear}</p>
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Music size={18} /> My Songs</h2>
          <button onClick={() => setShowSongForm(!showSongForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition">
            <Upload size={14} /> {showSongForm ? 'Cancel' : 'Upload Song'}
          </button>
        </div>

        {showSongForm && (
          <UploadSongForm albums={dash.albums} onDone={() => { setShowSongForm(false); fetchDashboard(); }} />
        )}

        {dash.songs.length > 0 && (
          <div className="flex gap-1 mb-3">
            {(['all', 'published', 'draft', 'archived'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    statusFilter === s
                      ? 'bg-red-400 text-white'
                      : 'bg-surface-secondary text-text-secondary hover:bg-surface-highlight'
                }`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="ml-1 opacity-60">({statusCounts[s]})</span>
              </button>
            ))}
          </div>
        )}

        {filteredSongs.length === 0 ? (
          <div className="bg-surface-secondary rounded-xl p-8 text-center text-text-secondary text-sm">
            <Music size={32} className="mx-auto mb-2 text-text-subdued" />
            {dash.songs.length === 0 ? 'No songs yet. Upload your first track!' : 'No songs match this filter.'}
          </div>
        ) : (
          <div className="bg-surface-secondary rounded-xl overflow-hidden">
            {filteredSongs.map((song, i) => (
              editingSong?.id === song.id ? (
                <InlineSongEdit key={song.id} song={song} albums={dash.albums} onDone={() => { setEditingSong(null); fetchDashboard(); }} onCancel={() => setEditingSong(null)} />
              ) : (
                <div key={song.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-highlight transition group">
                  <span className="text-xs text-text-subdued w-5 text-right">{i + 1}</span>
                  <div className="w-9 h-9 rounded flex items-center justify-center shrink-0 overflow-hidden bg-cover bg-center" style={{ background: song.coverUrl ? `url(${song.coverUrl})` : '#333' }}>
                    {!song.coverUrl && <Music size={16} className="text-text-subdued" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <ArtistAvatar imageUrl={song.artistImageUrl} name={song.artistName} className="w-4 h-4 rounded-full shrink-0" iconSize={8} />
                      <p className="text-sm font-semibold truncate">{song.title}</p>
                    </div>
                    <p className="text-xs text-text-secondary truncate">{song.albumTitle || song.genre || 'Single'}</p>
                  </div>
                  <span className="text-xs text-text-subdued">{formatDuration(song.duration)}</span>
                  <StatusBadge status={song.status} />
                  <span className="text-xs text-text-subdued hidden sm:block">{song.plays || 0} plays</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => setEditingSong(song)}
                      className="p-1.5 rounded text-text-subdued hover:text-red-300 transition" title="Edit">
                      <Edit3 size={13} />
                    </button>
                    <button onClick={async () => { if (!confirm(`Delete "${song.title}"?`)) return; try { await api.delete(`/songs/${song.id}`); fetchDashboard(); } catch {} }}
                      className="p-1.5 rounded text-text-subdued hover:text-red-300 transition" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

function CreateAlbumForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState<SongStatus>('published');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<TrackEntry[]>([{ title: '', duration: '', audio: null, description: '' }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (!showLoader) return;
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [showLoader]);

  const updateTrack = (i: number, field: keyof TrackEntry, value: any) => {
    setTracks(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  };

  const addTrack = () => {
    setTracks(prev => [...prev, { title: '', duration: '', audio: null, description: '' }]);
  };

  const removeTrack = (i: number) => {
    setTracks(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || tracks.length === 0) return;
    const validTracks = tracks.filter(t => t.title.trim() && t.duration && t.audio);
    if (validTracks.length === 0) { setError('Add at least one track with audio file'); return; }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('albumTitle', title.trim());
      fd.append('releaseYear', String(releaseYear));
      fd.append('genre', genre);
      fd.append('status', status);
      fd.append('trackCount', String(validTracks.length));
      if (coverFile) fd.append('cover', coverFile);
      validTracks.forEach((t, i) => {
        fd.append(`trackTitle_${i}`, t.title.trim());
        fd.append(`trackDuration_${i}`, t.duration);
        if (t.description) fd.append(`trackDescription_${i}`, t.description);
        if (t.audio) fd.append(`trackAudio_${i}`, t.audio);
      });
      await api.upload('/upload/album', fd);
      setShowLoader(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (showLoader) return <RedirectLoader />;

  return (
    <form onSubmit={handleSubmit} className="bg-surface-elevated rounded-xl p-5 mb-6 space-y-4">
      <h3 className="text-sm font-bold flex items-center gap-2"><Disc3 size={16} /> New Album with Tracks</h3>
      {error && <div className="text-text-primary text-xs bg-white/10 rounded p-2">{error}</div>}

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-text-secondary block mb-1">Album Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Album name"
            className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
        </div>
        <div>
          <label className="text-xs text-text-secondary block mb-1">Release Year</label>
          <input type="number" value={releaseYear} onChange={e => setReleaseYear(Number(e.target.value))} min={1900} max={2099}
            className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-text-secondary block mb-1">Genre</label>
          <select value={genre} onChange={e => setGenre(e.target.value)}
            className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent">
            <option value="">Auto (from artist)</option>
            <option value="Electronic">Electronic</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
            <option value="Afrobeat">Afrobeat</option>
            <option value="Synthwave">Synthwave</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="R&B">R&B</option>
            <option value="Indie">Indie</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-secondary block mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as SongStatus)}
            className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-secondary block mb-1">Cover Image</label>
          <div onClick={() => coverRef.current?.click()} className="p-2.5 rounded bg-surface-secondary border border-dashed border-surface-elevated text-center cursor-pointer hover:border-accent/50 transition">
            {coverFile ? <p className="text-xs text-accent truncate">{coverFile.name}</p> : <p className="text-xs text-text-secondary">Click to select</p>}
            <input ref={coverRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setCoverFile(e.target.files?.[0] || null)} hidden />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-text-secondary font-semibold">Tracks ({tracks.length})</label>
          <button type="button" onClick={addTrack} className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
            <Plus size={12} /> Add track
          </button>
        </div>
        <div className="space-y-2">
          {tracks.map((track, i) => (
            <div key={i} className="bg-surface-secondary rounded p-2.5 grid grid-cols-[1fr_70px_1fr_auto] gap-2 items-end">
              <div>
                <label className="text-[10px] text-text-subdued block mb-0.5">Title *</label>
                <input type="text" value={track.title} onChange={e => updateTrack(i, 'title', e.target.value)} required placeholder="Track name"
                  className="w-full p-2 rounded bg-surface-elevated text-text-primary text-xs outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
              </div>
              <div>
                <label className="text-[10px] text-text-subdued block mb-0.5">Duration *</label>
                <input type="number" value={track.duration} onChange={e => updateTrack(i, 'duration', e.target.value)} required min={1} placeholder="sec"
                  className="w-full p-2 rounded bg-surface-elevated text-text-primary text-xs outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
              </div>
              <div>
                <label className="text-[10px] text-text-subdued block mb-0.5">Audio *</label>
                <div onClick={() => document.getElementById(`audio-${i}`)?.click()} className="p-2 rounded bg-surface-elevated border border-dashed border-surface-elevated text-center cursor-pointer hover:border-accent/50 transition">
                  {track.audio ? <p className="text-[10px] text-accent truncate">{track.audio.name}</p> : <p className="text-[10px] text-text-secondary">Select file</p>}
                  <input id={`audio-${i}`} type="file" accept=".mp3,.wav,.flac,.ogg,.aac,.m4a" onChange={e => updateTrack(i, 'audio', e.target.files?.[0] || null)} hidden />
                </div>
              </div>
              {tracks.length > 1 && (
                <button type="button" onClick={() => removeTrack(i)} className="p-2 text-text-subdued hover:text-accent transition">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-full bg-accent text-white text-sm font-bold hover:bg-accent-hover transition disabled:opacity-50">
        {submitting ? `Creating album with ${tracks.filter(t => t.title.trim() && t.duration && t.audio).length} tracks...` : 'Create Album with Tracks'}
      </button>
    </form>
  );
}

interface TrackEntry {
  title: string;
  duration: string;
  audio: File | null;
  description: string;
}

function UploadSongForm({ albums, onDone }: { albums: Album[]; onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [status, setStatus] = useState<SongStatus>('published');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showLoader) return;
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [showLoader]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !duration) return;
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('duration', duration);
      fd.append('status', status);
      if (albumId) fd.append('albumId', albumId);
      if (genre) fd.append('genre', genre);
      if (description) fd.append('description', description);
      if (audioFile) fd.append('audio', audioFile);
      if (coverFile) fd.append('cover', coverFile);
      await api.upload('/upload/song', fd);
      setShowLoader(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (showLoader) return <RedirectLoader />;

  return (
    <form onSubmit={handleSubmit} className="bg-surface-elevated rounded-xl p-5 mb-4 space-y-3">
      <h3 className="text-sm font-bold">Upload Song</h3>
      {error && <div className="text-text-primary text-xs bg-white/10 rounded p-2">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-secondary block mb-1">Song Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Track name"
            className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
        </div>
        <div>
          <label className="text-xs text-text-secondary block mb-1">Duration (seconds) *</label>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} required min={1}
            placeholder="e.g. 240"
            className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-secondary block mb-1">Album</label>
          <select value={albumId} onChange={e => setAlbumId(e.target.value)}
            className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent">
            <option value="">Single (no album)</option>
            {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-secondary block mb-1">Genre</label>
          <select value={genre} onChange={e => setGenre(e.target.value)}
            className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent">
            <option value="">Auto (from artist)</option>
            <option value="Electronic">Electronic</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
            <option value="Afrobeat">Afrobeat</option>
            <option value="Synthwave">Synthwave</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="R&B">R&B</option>
            <option value="Indie">Indie</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-text-secondary block mb-1">Description (optional)</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Tell listeners about this track..."
          className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued resize-none" />
      </div>

      <div>
        <label className="text-xs text-text-secondary block mb-1">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value as SongStatus)}
          className="w-full p-2.5 rounded bg-surface-secondary text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent">
          <option value="published">Published (visible to everyone)</option>
          <option value="draft">Draft (only visible to you)</option>
          <option value="archived">Archived (hidden)</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-text-secondary block mb-1">Audio File *</label>
        <div onClick={() => audioRef.current?.click()} className="p-3 rounded bg-surface-secondary border border-dashed border-surface-elevated text-center cursor-pointer hover:border-accent/50 transition">
          {audioFile ? (
            <p className="text-sm text-accent">{audioFile.name}</p>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload size={18} className="text-text-subdued" />
              <p className="text-xs text-text-secondary">Click to select MP3, WAV, FLAC...</p>
            </div>
          )}
          <input ref={audioRef} type="file" accept=".mp3,.wav,.flac,.ogg,.aac,.m4a,.wma" onChange={e => setAudioFile(e.target.files?.[0] || null)} hidden />
        </div>
      </div>

      <div>
        <label className="text-xs text-text-secondary block mb-1">Cover Image (optional)</label>
        <div onClick={() => coverRef.current?.click()} className="p-3 rounded bg-surface-secondary border border-dashed border-surface-elevated text-center cursor-pointer hover:border-accent/50 transition">
          {coverFile ? (
            <p className="text-sm text-accent">{coverFile.name}</p>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload size={18} className="text-text-subdued" />
              <p className="text-xs text-text-secondary">Click to select cover art</p>
            </div>
          )}
          <input ref={coverRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={e => setCoverFile(e.target.files?.[0] || null)} hidden />
        </div>
      </div>

      <button type="submit" disabled={submitting} className="px-5 py-2 rounded-full bg-accent text-white text-sm font-bold hover:bg-accent-hover transition disabled:opacity-50">
        {submitting ? 'Uploading...' : 'Upload Song'}
      </button>
    </form>
  );
}

function InlineSongEdit({ song, albums, onDone, onCancel }: { song: Song; albums: Album[]; onDone: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(song.title);
  const [duration, setDuration] = useState(String(song.duration));
  const [genre, setGenre] = useState(song.genre || '');
  const [status, setStatus] = useState(song.status);
  const [description, setDescription] = useState(song.description || '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [albumId, setAlbumId] = useState(song.albumId || '');
  const [tags, setTags] = useState(song.tags?.join(', ') || '');
  const [language, setLanguage] = useState(song.language || '');
  const [explicit, setExplicit] = useState(song.explicit || false);
  const [trackNumber, setTrackNumber] = useState(song.trackNumber ? String(song.trackNumber) : '');
  const [lyrics, setLyrics] = useState(song.lyrics || '');
  const [saving, setSaving] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : null;

  useEffect(() => {
    if (!showLoader) return;
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [showLoader]);

  const LANGUAGES = [
    '', 'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi',
    'Swahili', 'Zulu', 'Yoruba', 'Afrikaans', 'Amharic',
  ];

  const handleSave = async () => {
    if (!title.trim() || !duration) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('duration', String(Number(duration)));
      fd.append('genre', genre);
      fd.append('status', status);
      fd.append('description', description);
      fd.append('albumId', albumId);
      fd.append('tags', tags);
      fd.append('language', language);
      fd.append('explicit', String(explicit));
      fd.append('trackNumber', trackNumber);
      fd.append('lyrics', lyrics);
      if (coverFile) fd.append('cover', coverFile);
      if (audioFile) fd.append('audio', audioFile);
      await api.uploadPut(`/songs/${song.id}`, fd);
      setShowLoader(true);
    } catch { setSaving(false); }
  };

  if (showLoader) return <RedirectLoader />;

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col" onClick={onCancel}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-elevated shrink-0">
        <h2 className="text-lg font-bold">Update song details</h2>
        <button onClick={onCancel} className="p-1.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-highlight transition">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8">

          {/* Left column */}
          <div className="space-y-4">
            <div onClick={() => coverRef.current?.click()} className="relative aspect-square rounded-xl overflow-hidden bg-surface-elevated flex items-center justify-center cursor-pointer group border-2 border-dashed border-surface-elevated hover:border-accent/50 transition">
              {(coverPreview || song.coverUrl) ? (
                <img src={coverPreview || song.coverUrl || ''} alt="" className="w-full h-full object-cover" />
              ) : (
                <Music size={36} className="text-text-subdued" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition">Change thumbnail</span>
              </div>
              <input ref={coverRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={e => setCoverFile(e.target.files?.[0] || null)} hidden />
            </div>

            <div className="bg-surface-elevated rounded-xl p-4">
              <p className="text-xs text-text-subdued font-semibold mb-2">Duration (seconds)</p>
              <input value={duration} onChange={e => setDuration(e.target.value)} type="number" min={1}
                className="w-full p-2.5 rounded-lg bg-surface-secondary text-sm text-text-primary text-center outline-none focus:outline-2 focus:outline-accent" />
            </div>

            <div className="bg-surface-elevated rounded-xl p-4">
              <p className="text-xs text-text-subdued font-semibold mb-2">Status</p>
              <select value={status} onChange={e => setStatus(e.target.value as SongStatus)}
                className="w-full p-2.5 rounded-lg bg-surface-secondary text-sm text-text-primary outline-none focus:outline-2 focus:outline-accent">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="bg-surface-elevated rounded-xl p-4">
              <p className="text-xs text-text-subdued font-semibold mb-2">Audio file</p>
              <div onClick={() => audioRef.current?.click()} className="p-3 rounded-lg bg-surface-secondary border border-dashed border-surface-elevated text-center cursor-pointer hover:border-accent/50 transition">
                {audioFile ? (
                  <p className="text-xs text-accent truncate">{audioFile.name}</p>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload size={16} className="text-text-subdued" />
                    <p className="text-[10px] text-text-secondary">Replace audio file</p>
                  </div>
                )}
                <input ref={audioRef} type="file" accept=".mp3,.wav,.flac,.ogg,.aac,.m4a" onChange={e => setAudioFile(e.target.files?.[0] || null)} hidden />
              </div>
              {song.audioUrl && (
                <button onClick={() => { const a = new Audio(song.audioUrl); a.play(); }} className="mt-2 flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition w-full justify-center p-2 rounded-lg bg-surface-secondary">
                  <Play size={12} /> Preview current
                </button>
              )}
            </div>

            <div className="bg-surface-elevated rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-subdued font-semibold">Explicit</p>
                <button onClick={() => setExplicit(!explicit)} className={`w-10 h-5 rounded-full transition-colors relative ${explicit ? 'bg-accent' : 'bg-surface-secondary'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${explicit ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div>
              <label className="text-xs text-text-subdued font-semibold block mb-1.5">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-elevated text-text-primary text-base outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
            </div>

            <div>
              <label className="text-xs text-text-subdued font-semibold block mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                className="w-full p-3 rounded-xl bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-subdued font-semibold block mb-1.5">Album</label>
                <select value={albumId} onChange={e => setAlbumId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent">
                  <option value="">Single (no album)</option>
                  {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-subdued font-semibold block mb-1.5">Track number</label>
                <input value={trackNumber} onChange={e => setTrackNumber(e.target.value)} type="number" min={1}
                  className="w-full p-3 rounded-xl bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-subdued font-semibold block mb-1.5">Genre</label>
                <select value={genre} onChange={e => setGenre(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent">
                  <option value="">No genre</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                  <option value="Afrobeat">Afrobeat</option>
                  <option value="Synthwave">Synthwave</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="R&B">R&B</option>
                  <option value="Indie">Indie</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-subdued font-semibold block mb-1.5">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l || 'No language'}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-text-subdued font-semibold block mb-1.5">Tags (comma separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. chill, vibes, acoustic"
                className="w-full p-3 rounded-xl bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
            </div>

            <div>
              <label className="text-xs text-text-subdued font-semibold block mb-1.5">Lyrics</label>
              <textarea value={lyrics} onChange={e => setLyrics(e.target.value)} rows={5}
                className="w-full p-3 rounded-xl bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued resize-none font-mono leading-relaxed" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-elevated shrink-0">
        <button onClick={onCancel} className="px-5 py-2 rounded-full text-sm font-semibold text-text-secondary hover:text-text-primary transition">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2 rounded-full bg-accent text-white text-sm font-bold hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2">
          {saving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function InlineAlbumEdit({ album, onDone, onCancel }: { album: Album; onDone: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(album.title);
  const [releaseYear, setReleaseYear] = useState(album.releaseYear || new Date().getFullYear());
  const [saving, setSaving] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (!showLoader) return;
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [showLoader]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.put(`/albums/${album.id}`, { title: title.trim(), releaseYear });
      setShowLoader(true);
    } catch { setSaving(false); }
  };

  if (showLoader) return <RedirectLoader />;

  return (
    <div className="bg-surface-secondary rounded-lg p-3 col-span-full sm:col-span-1">
      <div className="aspect-square rounded bg-surface-elevated mb-2 overflow-hidden flex items-center justify-center">
        {album.coverUrl ? (
          <img src={album.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Disc3 size={24} className="text-text-subdued" />
        )}
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)}
        className="w-full p-1.5 rounded bg-surface-elevated text-sm outline-none focus:outline-2 focus:outline-accent mb-1" />
      <input value={releaseYear} onChange={e => setReleaseYear(Number(e.target.value))} type="number" min={1900} max={2099}
        className="w-full p-1.5 rounded bg-surface-elevated text-xs outline-none focus:outline-2 focus:outline-accent mb-2" />
      <div className="flex gap-1">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-1.5 rounded bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition disabled:opacity-50">
          Save
        </button>
        <button onClick={onCancel}
          className="py-1.5 px-3 rounded bg-surface-elevated text-text-secondary text-xs hover:text-text-primary transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const statusColors: Record<SongStatus, string> = {
  draft: 'bg-yellow-500/20 text-yellow-400',
  published: 'bg-green-500/20 text-green-400',
  archived: 'bg-gray-500/20 text-gray-400',
};

function StatusBadge({ status }: { status: SongStatus }) {
  return (
    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${statusColors[status]}`}>
      {status}
    </span>
  );
}
