import mongoose from 'mongoose';
import { connectDb } from './db';
import { Artist } from './models/Artist';
import { Album } from './models/Album';
import { Song } from './models/Song';
import { Playlist } from './models/Playlist';

async function cleanupSeed() {
  await connectDb();

  const seedArtists = await Artist.find({ userId: { $exists: false } });
  const seedArtistIds = seedArtists.map(a => a._id);

  if (seedArtistIds.length === 0) {
    console.log('No seed artists found. Nothing to clean up.');
    await mongoose.disconnect();
    return;
  }

  const seedSongs = await Song.find({ artistId: { $in: seedArtistIds } });
  const seedSongIds = seedSongs.map(s => s._id);

  await Playlist.updateMany(
    { 'songs.songId': { $in: seedSongIds } },
    { $pull: { songs: { songId: { $in: seedSongIds } } } }
  );
  console.log(`Removed ${seedSongIds.length} seed songs from playlists`);

  const songResult = await Song.deleteMany({ artistId: { $in: seedArtistIds } });
  console.log(`Deleted ${songResult.deletedCount} seed songs`);

  const albumResult = await Album.deleteMany({ artistId: { $in: seedArtistIds } });
  console.log(`Deleted ${albumResult.deletedCount} seed albums`);

  const artistResult = await Artist.deleteMany({ _id: { $in: seedArtistIds } });
  console.log(`Deleted ${artistResult.deletedCount} seed artists`);

  console.log('Seed data cleanup complete!');
  await mongoose.disconnect();
}

cleanupSeed().catch(console.error);
