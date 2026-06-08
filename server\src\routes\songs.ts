import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Song } from '../models/Song';
import { Artist } from '../models/Artist';
import { Album } from '../models/Album';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (imageExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const genre = req.query.genre as string;
    const search = req.query.search as string;
    const sort = (req.query.sort as string) === 'createdAt' ? 'createdAt' : 'plays';

    const filter: any = {};
    if (genre) filter.genre = genre;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption: Record<string, 1 | -1> = sort === 'createdAt' ? { createdAt: -1 } : { plays: -1 };

    const [songs, total] = await Promise.all([
      Song.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      Song.countDocuments(filter),
    ]);

    const artistIds = [...new Set(songs.map(s => s.artistId?.toString()).filter(Boolean))];
    const artists = await Artist.find({ _id: { $in: artistIds } }).select('imageUrl').lean();
    const artistImageMap = new Map(artists.map(a => [a._id.toString(), a.imageUrl]));

    res.json({
      success: true,
      data: songs.map((s: any) => ({
        id: s._id, title: s.title, artistId: s.artistId, artistName: s.artistName,
        artistImageUrl: artistImageMap.get(s.artistId?.toString()) || undefined,
        albumId: s.albumId, albumTitle: s.albumTitle, duration: s.duration,
        genre: s.genre, audioUrl: s.audioUrl, coverUrl: s.coverUrl,
        description: s.description, plays: s.plays, status: s.status,
        tags: s.tags, language: s.language, explicit: s.explicit,
        trackNumber: s.trackNumber, lyrics: s.lyrics,
      })),
      total, page, limit,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true }
    ).lean();
    if (!song) {
      res.status(404).json({ success: false, error: 'Song not found' });
      return;
    }
    let artistImageUrl: string | undefined;
    if (song.artistId) {
      const artist = await Artist.findById(song.artistId).select('imageUrl').lean();
      if (artist) artistImageUrl = artist.imageUrl;
    }
    res.json({
      success: true,
      data: {
        id: song._id, title: song.title, artistId: song.artistId, artistName: song.artistName,
        artistImageUrl,
        albumId: song.albumId, albumTitle: song.albumTitle, duration: song.duration,
        genre: song.genre, audioUrl: song.audioUrl, coverUrl: song.coverUrl,
        description: song.description, plays: song.plays, status: song.status,
        tags: song.tags, language: song.language, explicit: song.explicit,
        trackNumber: song.trackNumber, lyrics: song.lyrics,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/genres/list', async (_req: Request, res: Response) => {
  try {
    const genres = await Song.distinct('genre');
    res.json({ success: true, data: genres.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', authMiddleware, upload.single('cover'), async (req: AuthRequest, res: Response) => {
  try {
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(403).json({ success: false, error: 'Only artists can edit songs' });
      return;
    }
    const song = await Song.findById(req.params.id);
    if (!song) {
      res.status(404).json({ success: false, error: 'Song not found' });
      return;
    }
    if (song.artistId.toString() !== artist._id.toString()) {
      res.status(403).json({ success: false, error: 'You can only edit your own songs' });
      return;
    }
    const { title, duration, genre, description, coverUrl, status, albumId, tags, language, explicit, trackNumber, lyrics } = req.body;
    if (title !== undefined) song.title = title;
    if (duration !== undefined) song.duration = Number(duration);
    if (genre !== undefined) song.genre = genre;
    if (description !== undefined) song.description = description;
    if (coverUrl !== undefined) song.coverUrl = coverUrl;
    if (status !== undefined) song.status = status;
    if (albumId !== undefined) {
      song.albumId = albumId ? (albumId as any) : undefined;
      if (albumId) {
        const album = await Album.findById(albumId).select('title');
        if (album) song.albumTitle = album.title;
      } else {
        song.albumTitle = undefined;
      }
    }
    if (tags !== undefined) song.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    if (language !== undefined) song.language = language;
    if (explicit !== undefined) song.explicit = explicit === 'true' || explicit === true;
    if (trackNumber !== undefined) song.trackNumber = Number(trackNumber);
    if (lyrics !== undefined) song.lyrics = lyrics;
    if (req.file) song.coverUrl = `/uploads/${req.file.filename}`;
    await song.save();
    res.json({ success: true, data: song });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(403).json({ success: false, error: 'Only artists can delete songs' });
      return;
    }
    const song = await Song.findById(req.params.id);
    if (!song) {
      res.status(404).json({ success: false, error: 'Song not found' });
      return;
    }
    if (song.artistId.toString() !== artist._id.toString()) {
      res.status(403).json({ success: false, error: 'You can only delete your own songs' });
      return;
    }
    await Song.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
