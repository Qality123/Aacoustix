import { Router, Request, Response } from 'express';
import { Follow } from '../models/Follow';
import { Artist } from '../models/Artist';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

router.post('/:artistId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const artist = await Artist.findById(req.params.artistId);
    if (!artist) {
      res.status(404).json({ success: false, error: 'Artist not found' });
      return;
    }
    const existing = await Follow.findOne({ userId: req.userId, artistId: req.params.artistId });
    if (existing) {
      res.status(400).json({ success: false, error: 'Already following this artist' });
      return;
    }
    await Follow.create({ userId: req.userId, artistId: req.params.artistId });
    res.json({ success: true, message: 'Now following' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:artistId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await Follow.findOneAndDelete({ userId: req.userId, artistId: req.params.artistId });
    res.json({ success: true, message: 'Unfollowed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/check/:artistId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const follow = await Follow.findOne({ userId: req.userId, artistId: req.params.artistId });
    res.json({ success: true, data: { following: !!follow } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/count/:artistId', async (req: Request, res: Response) => {
  try {
    const count = await Follow.countDocuments({ artistId: req.params.artistId });
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/my-follows', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const follows = await Follow.find({ userId: req.userId }).populate('artistId', 'name imageUrl genre').lean();
    const artists = follows.map(f => ({
      id: (f.artistId as any)._id,
      name: (f.artistId as any).name,
      imageUrl: (f.artistId as any).imageUrl,
      genre: (f.artistId as any).genre,
    }));
    res.json({ success: true, data: artists });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
