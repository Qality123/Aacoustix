import { Router, Response } from 'express';
import { Playlist } from '../models/Playlist';
import { Artist } from '../models/Artist';
import { AuthRequest, authMiddleware } from '../auth';

const router = Router();

const ALLOWED_PLAYLIST_FIELDS = ['name', 'description', 'isPublic', 'coverUrl'];

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const playlists = await Playlist.find({
      $or: [{ userId: req.userId }, { isPublic: true }],
    }).sort({ updatedAt: -1 }).lean();

    const result = playlists.map((p: any) => ({
      id: p._id, name: p.name, description: p.description, coverUrl: p.coverUrl,
      userId: p.userId, isPublic: p.isPublic,
      songCount: p.songs?.length || 0,
      createdAt: p.createdAt, updatedAt: p.updatedAt,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('songs.songId')
      .lean();
    if (!playlist) {
      res.status(404).json({ success: false, error: 'Playlist not found' });
      return;
    }

    const rawSongs = (playlist as any).songs
      .sort((a: any, b: any) => a.position - b.position)
      .map((s: any) => s.songId)
      .filter(Boolean);

    const artistIds = [...new Set(rawSongs.map((s: any) => s.artistId?.toString()).filter(Boolean))];
    const artists = await Artist.find({ _id: { $in: artistIds } }).select('imageUrl').lean();
    const artistImageMap = new Map(artists.map(a => [a._id.toString(), a.imageUrl]));

    const songs = rawSongs.map((s: any) => ({
      id: s._id, title: s.title, artistId: s.artistId, artistName: s.artistName,
      artistImageUrl: artistImageMap.get(s.artistId?.toString()) || undefined,
      albumId: s.albumId, albumTitle: s.albumTitle, duration: s.duration,
      genre: s.genre, audioUrl: s.audioUrl, coverUrl: s.coverUrl, plays: s.plays,
    }));

    res.json({
      success: true,
      data: {
        id: playlist._id, name: playlist.name, description: playlist.description,
        coverUrl: playlist.coverUrl, userId: playlist.userId, isPublic: playlist.isPublic,
        songs, createdAt: playlist.createdAt, updatedAt: playlist.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, isPublic } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Name required' });
      return;
    }
    const playlist = await Playlist.create({
      name, description, userId: req.userId, isPublic: isPublic || false,
    });
    res.status(201).json({
      success: true,
      data: { id: playlist._id, name: playlist.name, description: playlist.description, userId: playlist.userId, isPublic: playlist.isPublic },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const update: Record<string, any> = { updatedAt: new Date() };
    for (const key of ALLOWED_PLAYLIST_FIELDS) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: update },
      { new: true }
    );
    if (!playlist) {
      res.status(404).json({ success: false, error: 'Playlist not found or not yours' });
      return;
    }
    res.json({ success: true, data: { id: playlist._id } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await Playlist.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) {
      res.status(404).json({ success: false, error: 'Playlist not found or not yours' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/:id/songs', async (req: AuthRequest, res: Response) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.userId });
    if (!playlist) {
      res.status(404).json({ success: false, error: 'Playlist not found or not yours' });
      return;
    }

    const { songId } = req.body;
    const maxPos = playlist.songs.reduce((max, s) => Math.max(max, s.position), 0);
    playlist.songs.push({ songId, position: maxPos + 1, addedAt: new Date() } as any);
    playlist.updatedAt = new Date();
    await playlist.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id/songs/:songId', async (req: AuthRequest, res: Response) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.userId });
    if (!playlist) {
      res.status(404).json({ success: false, error: 'Playlist not found or not yours' });
      return;
    }

    playlist.songs = playlist.songs.filter((s: any) => s.songId?.toString() !== req.params.songId);
    playlist.updatedAt = new Date();
    await playlist.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
