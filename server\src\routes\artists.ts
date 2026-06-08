import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Artist } from '../models/Artist';
import { Album } from '../models/Album';
import { Song } from '../models/Song';
import { Like } from '../models/Like';
import { authMiddleware, AuthRequest } from '../auth';

const artistImageStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `artist-${crypto.randomUUID()}${ext}`);
  },
});

const uploadArtistImage = multer({
  storage: artistImageStorage,
  fileFilter: (_req, file, cb) => {
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (imageExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image type: ${ext}`));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

function getPeriodDate(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '180d': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case '365d': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all': return null;
    default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

const router = Router();

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(404).json({ success: false, error: 'Artist profile not found' });
      return;
    }
    const [albums, songs] = await Promise.all([
      Album.find({ artistId: artist._id }).lean(),
      Song.find({ artistId: artist._id }).sort({ createdAt: -1 }).lean(),
    ]);

    const songIds = songs.map(s => s._id);
    const likes = await Like.find({ songId: { $in: songIds } }).lean();
    const likeCountMap = new Map<string, number>();
    likes.forEach(l => {
      const id = l.songId.toString();
      likeCountMap.set(id, (likeCountMap.get(id) || 0) + 1);
    });

    res.json({
      success: true,
      data: {
        id: artist._id, name: artist.name, fullName: artist.fullName, bio: artist.bio, imageUrl: artist.imageUrl,
        genre: artist.genre, country: artist.country, dateOfBirth: artist.dateOfBirth,
        recordLabel: artist.recordLabel, website: artist.website, socialLinks: artist.socialLinks, whatILove: artist.whatILove,
        albums: albums.map((a: any) => ({ id: a._id, title: a.title, coverUrl: a.coverUrl, releaseYear: a.releaseYear })),
        songs: songs.map((s: any) => ({
          id: s._id, title: s.title, artistId: s.artistId, artistName: s.artistName, artistImageUrl: artist.imageUrl,
          albumId: s.albumId, albumTitle: s.albumTitle,
          duration: s.duration, genre: s.genre, audioUrl: s.audioUrl, coverUrl: s.coverUrl, plays: s.plays,
          status: s.status, likes: likeCountMap.get(s._id.toString()) || 0,
          description: s.description, tags: s.tags, language: s.language, explicit: s.explicit,
          trackNumber: s.trackNumber, lyrics: s.lyrics,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/report', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(404).json({ success: false, error: 'Artist profile not found' });
      return;
    }

    const period = (req.query.period as string) || '7d';
    const since = getPeriodDate(period);

    const songs = await Song.find({ artistId: artist._id }).lean();
    const songIds = songs.map(s => s._id);

    const likeFilter: any = { songId: { $in: songIds } };
    if (since) likeFilter.createdAt = { $gte: since };

    const [periodLikes, allLikes] = since
      ? await Promise.all([
          Like.find(likeFilter).lean(),
          Like.find({ songId: { $in: songIds } }).lean(),
        ])
      : [await Like.find({ songId: { $in: songIds } }).lean(), null];

    const songsCreated = since
      ? songs.filter(s => s.createdAt && new Date(s.createdAt) >= since).length
      : songs.length;

    const likeCountMap = new Map<string, number>();
    periodLikes.forEach(l => {
      const id = l.songId.toString();
      likeCountMap.set(id, (likeCountMap.get(id) || 0) + 1);
    });

    const songsWithStats = songs.map(s => ({
      id: s._id,
      title: s.title,
      plays: s.plays,
      likes: allLikes ? allLikes.filter(l => l.songId.toString() === s._id.toString()).length : (likeCountMap.get(s._id.toString()) || 0),
      periodLikes: likeCountMap.get(s._id.toString()) || 0,
      createdAt: s.createdAt,
    })).sort((a, b) => b.plays - a.plays);

    res.json({
      success: true,
      data: {
        period,
        totalPlays: songs.reduce((sum, s) => sum + (s.plays || 0), 0),
        totalPeriodLikes: periodLikes.length,
        songsCreated,
        totalSongs: songs.length,
        topSongs: songsWithStats.slice(0, 10),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, fullName, bio, genre, country, dateOfBirth, recordLabel, website, socialLinks, whatILove } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Artist name is required' });
      return;
    }
    const existing = await Artist.findOne({ name });
    if (existing) {
      res.status(400).json({ success: false, error: 'Artist with this name already exists' });
      return;
    }
    const artist = await Artist.create({
      name, fullName, bio, genre, country, dateOfBirth, recordLabel, website, socialLinks, whatILove,
      userId: req.userId,
    });
    res.status(201).json({
      success: true,
      data: {
        id: artist._id, name: artist.name, fullName: artist.fullName, bio: artist.bio,
        genre: artist.genre, imageUrl: artist.imageUrl, country: artist.country,
        dateOfBirth: artist.dateOfBirth, recordLabel: artist.recordLabel,
        website: artist.website, socialLinks: artist.socialLinks, whatILove: artist.whatILove,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }
    const artists = await Artist.find(filter).lean();
    res.json({
      success: true,
      data: artists.map((a: any) => ({
        id: a._id, name: a.name, fullName: a.fullName, bio: a.bio, imageUrl: a.imageUrl,
        genre: a.genre, country: a.country, dateOfBirth: a.dateOfBirth,
        recordLabel: a.recordLabel, website: a.website, socialLinks: a.socialLinks, whatILove: a.whatILove,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const artist = await Artist.findById(req.params.id).lean();
    if (!artist) {
      res.status(404).json({ success: false, error: 'Artist not found' });
      return;
    }

    const [albums, topSongs] = await Promise.all([
      Album.find({ artistId: req.params.id }).lean(),
      Song.find({ artistId: req.params.id }).sort({ plays: -1 }).limit(10).lean(),
    ]);

    res.json({
      success: true,
      data: {
        id: artist._id, name: artist.name, fullName: artist.fullName, bio: artist.bio,
        imageUrl: artist.imageUrl, genre: artist.genre, country: artist.country,
        dateOfBirth: artist.dateOfBirth, recordLabel: artist.recordLabel,
        website: artist.website, socialLinks: artist.socialLinks, whatILove: artist.whatILove,
        albums: albums.map((a: any) => ({ id: a._id, title: a.title, coverUrl: a.coverUrl, releaseYear: a.releaseYear })),
        topSongs: topSongs.map((s: any) => ({
          id: s._id, title: s.title, artistId: s.artistId, artistName: s.artistName,
          artistImageUrl: artist.imageUrl, duration: s.duration, genre: s.genre,
          audioUrl: s.audioUrl, coverUrl: s.coverUrl, albumId: s.albumId, albumTitle: s.albumTitle,
          plays: s.plays, status: s.status, description: s.description,
          tags: s.tags, language: s.language, explicit: s.explicit,
          trackNumber: s.trackNumber, lyrics: s.lyrics,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/image', authMiddleware, (req: AuthRequest, res: Response, next) => {
  uploadArtistImage.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    if (err) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    next();
  });
}, async (req: AuthRequest, res: Response) => {
  try {
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(403).json({ success: false, error: 'You must be an artist to update profile image' });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'Image file is required' });
      return;
    }
    artist.imageUrl = `/uploads/${file.filename}`;
    await artist.save();
    res.json({
      success: true,
      data: { id: artist._id, name: artist.name, imageUrl: artist.imageUrl },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
