import { Router, Response } from 'express';
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
    const audioExts = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a', '.wma'];
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if ([...audioExts, ...imageExts].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/album', authMiddleware, (req: AuthRequest, res: Response, next) => {
  upload.any()(req, res, (err) => {
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
    const { albumTitle, releaseYear, coverUrl, genre, trackCount } = req.body;
    if (!albumTitle || !trackCount) {
      res.status(400).json({ success: false, error: 'Album title and track count required' });
      return;
    }
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(403).json({ success: false, error: 'You must be an artist to create albums' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const coverFile = files.find(f => f.fieldname === 'cover');
    const album = await Album.create({
      title: albumTitle,
      artistId: artist._id,
      artistName: artist.name,
      coverUrl: coverFile ? `/uploads/${coverFile.filename}` : (coverUrl || undefined),
      releaseYear: Number(releaseYear) || new Date().getFullYear(),
    });

    const count = Number(trackCount);
    const songIds: string[] = [];

    for (let i = 0; i < count; i++) {
      const trackTitle = req.body[`trackTitle_${i}`];
      const trackDuration = req.body[`trackDuration_${i}`];
      if (!trackTitle || !trackDuration) continue;

      const audioFile = files.find(f => f.fieldname === `trackAudio_${i}`);
      if (!audioFile) continue;

      const song = await Song.create({
        title: trackTitle,
        artistId: artist._id,
        artistName: artist.name,
        albumId: album._id,
        albumTitle: album.title,
        duration: Number(trackDuration),
        genre: genre || artist.genre || undefined,
        description: req.body[`trackDescription_${i}`] || undefined,
        audioUrl: `/uploads/${audioFile.filename}`,
        status: req.body.status || 'published',
      });
      songIds.push(song._id.toString());
    }

    res.status(201).json({
      success: true,
      data: {
        album: { id: album._id, title: album.title, coverUrl: album.coverUrl, releaseYear: album.releaseYear },
        songs: songIds.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/song', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]), async (req: AuthRequest, res: Response) => {
  try {
    const { title, albumId, genre, duration, description, status } = req.body;
    if (!title || !duration) {
      res.status(400).json({ success: false, error: 'Title and duration are required' });
      return;
    }
    const artist = await Artist.findOne({ userId: req.userId });
    if (!artist) {
      res.status(403).json({ success: false, error: 'You must be an artist to upload songs' });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const audioFile = files?.audio?.[0];
    const coverFile = files?.cover?.[0];

    if (!audioFile) {
      res.status(400).json({ success: false, error: 'Audio file is required' });
      return;
    }

    let albumTitle: string | undefined;
    if (albumId) {
      const album = await Album.findById(albumId);
      if (album) albumTitle = album.title;
    }

    const song = await Song.create({
      title,
      artistId: artist._id,
      artistName: artist.name,
      albumId: albumId || undefined,
      albumTitle,
      duration: Number(duration),
      genre: genre || artist.genre || undefined,
      description: description || undefined,
      audioUrl: `/uploads/${audioFile.filename}`,
      coverUrl: coverFile ? `/uploads/${coverFile.filename}` : undefined,
      status: status || 'published',
    });

    res.status(201).json({
      success: true,
      data: {
        id: song._id, title: song.title, artistName: song.artistName,
        albumId: song.albumId, albumTitle: song.albumTitle,
        duration: song.duration, genre: song.genre,
        audioUrl: song.audioUrl, coverUrl: song.coverUrl, description: song.description, plays: song.plays,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
