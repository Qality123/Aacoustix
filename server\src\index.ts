import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDb } from './db';
import authRoutes from './routes/auth';
import songRoutes from './routes/songs';
import playlistRoutes from './routes/playlists';
import artistRoutes from './routes/artists';
import albumRoutes from './routes/albums';
import uploadRoutes from './routes/upload';
import likeRoutes from './routes/likes';
import followRoutes from './routes/follows';

async function main() {
  await connectDb();

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.use('/api/auth', authRoutes);
  app.use('/api/songs', songRoutes);
  app.use('/api/playlists', playlistRoutes);
  app.use('/api/artists', artistRoutes);
  app.use('/api/albums', albumRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/likes', likeRoutes);
  app.use('/api/follows', followRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Music Platform API is running' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);
