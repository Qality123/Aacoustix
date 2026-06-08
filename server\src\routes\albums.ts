import { Router, Request, Response } from 'express';
import { Album } from '../models/Album';
import { Song } from '../models/Song';
import { Artist } from '../models/Artist';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const albums = await Album.find().sort({ releaseYear: -1 }).lean();
    const artistIds = [...new Set(albums.map(a => a.artistId?.toString()).filter(Boolean))];
    const artists = await Artist.find({ _id: { $in: artistIds } }).select('name imageUrl').lean();
    const artistMap = new Map(artists.map(a => [a._id.toString(), a]));

    res.json({
      success: true,
      data: albums.map((a: any) => ({
        id: a._id, title: a.title, artistId: a.artistId,
        artistName: a.artistName,
        artistImageUrl: artistMap.get(a.artistId?.toString())?.imageUrl || undefined,
        coverUrl: a.coverUrl, releaseYear: a.releaseYear,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id).lean();
    if (!album) {
      res.status(404).json({ success: false, error: 'Album not found' });
      return;
    }
    const songs = await Song.find({ albumId: req.params.id }).sort({ createdAt: 1 }).lean();
    let artistImageUrl: string | undefined;
    if (album.artistId) {
      const artist = await Artist.findById(album.artistId).select('imageUrl').lean();
      if (artist) artistImageUrl = artist.imageUrl;
    }
    res.json({
      success: true,
      data: {
        id: album._id, title: album.title, artistId: album.artistId, artistName: album.artistName,
        artistImageUrl, coverUrl: album.coverUrl, releaseYear: album.releaseYear,
        songs: songs.map((s: any) => ({
          id: s._id, title: s.title, artistId: s.artistId, artistName: s.artistName,
          artistImageUrl, albumId: s.albumId, albumTitle: s.albumTitle, duration: s.duration,
          genre: s.genre, audioUrl: s.audioUrl, coverUrl: s.coverUrl, description: s.description, plays: s.plays,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, coverUrl, releaseYear } = req.body;
    if (!title) {
      res.status(400).json({ success: false, error: 'Album title is required' });
      return;
    }
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(403).json({ success: false, error: 'You must be an artist to create albums' });
      return;
    }
    const existing = await Album.findOne({ title, artistId: artist._id });
    if (existing) {
      res.status(400).json({ success: false, error: 'You already have an album with this name' });
      return;
    }
    const album = await Album.create({
      title, artistId: artist._id, artistName: artist.name,
      coverUrl, releaseYear: releaseYear || new Date().getFullYear(),
    });
    res.status(201).json({
      success: true,
      data: { id: album._id, title: album.title, coverUrl: album.coverUrl, releaseYear: album.releaseYear },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(403).json({ success: false, error: 'Only artists can edit albums' });
      return;
    }
    const album = await Album.findById(req.params.id);
    if (!album) {
      res.status(404).json({ success: false, error: 'Album not found' });
      return;
    }
    if (album.artistId.toString() !== artist._id.toString()) {
      res.status(403).json({ success: false, error: 'You can only edit your own albums' });
      return;
    }
    const { title, releaseYear, coverUrl } = req.body;
    if (title !== undefined) album.title = title;
    if (releaseYear !== undefined) album.releaseYear = Number(releaseYear);
    if (coverUrl !== undefined) album.coverUrl = coverUrl;
    await album.save();
    if (title !== undefined) {
      await Song.updateMany({ albumId: album._id }, { albumTitle: album.title });
    }
    res.json({ success: true, data: album });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(403).json({ success: false, error: 'Only artists can delete albums' });
      return;
    }
    const album = await Album.findById(req.params.id);
    if (!album) {
      res.status(404).json({ success: false, error: 'Album not found' });
      return;
    }
    if (album.artistId.toString() !== artist._id.toString()) {
      res.status(403).json({ success: false, error: 'You can only delete your own albums' });
      return;
    }
    await Song.deleteMany({ albumId: album._id });
    await Album.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Album and its songs deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
