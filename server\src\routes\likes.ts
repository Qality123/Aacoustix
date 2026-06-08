import { Router, Response } from 'express';
import { Like } from '../models/Like';
import { Song } from '../models/Song';
import { Artist } from '../models/Artist';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();
router.use(authMiddleware);

router.get('/count/:songId', async (req: AuthRequest, res: Response) => {
  try {
    const count = await Like.countDocuments({ songId: req.params.songId });
    res.json({ success: true, data: { count } });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const likes = await Like.find({ userId: req.userId }).lean();
    res.json({ success: true, data: likes.map(l => l.songId.toString()) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/songs', async (req: AuthRequest, res: Response) => {
  try {
    const likes = await Like.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    const songIds = likes.map(l => l.songId);
    const songs = await Song.find({ _id: { $in: songIds } }).lean();
    const artistIds = [...new Set(songs.map(s => s.artistId?.toString()).filter(Boolean))];
    const artists = await Artist.find({ _id: { $in: artistIds } }).select('imageUrl').lean();
    const artistImageMap = new Map(artists.map(a => [a._id.toString(), a.imageUrl]));
    const map = new Map(songs.map(s => [s._id.toString(), s]));
    const ordered = songIds.map(id => map.get(id.toString())).filter(Boolean);
    res.json({
      success: true,
      data: ordered.map((s: any) => ({
        id: s._id, title: s.title, artistId: s.artistId, artistName: s.artistName,
        artistImageUrl: artistImageMap.get(s.artistId?.toString()) || undefined,
        albumId: s.albumId, albumTitle: s.albumTitle, duration: s.duration,
        genre: s.genre, audioUrl: s.audioUrl, coverUrl: s.coverUrl, description: s.description, plays: s.plays,
      })),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/:songId', async (req: AuthRequest, res: Response) => {
  try {
    const { songId } = req.params;
    const existing = await Like.findOne({ userId: req.userId, songId });
    if (existing) {
      res.status(400).json({ success: false, error: 'Song already liked' });
      return;
    }
    await Like.create({ userId: req.userId, songId });
    res.status(201).json({ success: true, data: { songId } });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:songId', async (req: AuthRequest, res: Response) => {
  try {
    const { songId } = req.params;
    await Like.deleteOne({ userId: req.userId, songId });
    res.json({ success: true, data: { songId } });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
