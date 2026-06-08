import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPlaylist extends Document {
  name: string;
  description?: string;
  coverUrl?: string;
  userId: Types.ObjectId;
  songs: { songId: Types.ObjectId; position: number; addedAt: Date }[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>({
  name: { type: String, required: true },
  description: String,
  coverUrl: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{
    songId: { type: Schema.Types.ObjectId, ref: 'Song' },
    position: Number,
    addedAt: { type: Date, default: Date.now },
  }],
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
