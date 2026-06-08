import mongoose, { Document, Schema, Types } from 'mongoose';

export type SongStatus = 'draft' | 'published' | 'archived';

export interface ISong extends Document {
  title: string;
  artistId: Types.ObjectId;
  artistName: string;
  albumId?: Types.ObjectId;
  albumTitle?: string;
  duration: number;
  genre?: string;
  audioUrl: string;
  coverUrl?: string;
  description?: string;
  plays: number;
  status: SongStatus;
  tags?: string[];
  language?: string;
  explicit?: boolean;
  trackNumber?: number;
  lyrics?: string;
  createdAt: Date;
  updatedAt: Date;
}

const songSchema = new Schema<ISong>({
  title: { type: String, required: true },
  artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  artistName: { type: String, required: true },
  albumId: { type: Schema.Types.ObjectId, ref: 'Album' },
  albumTitle: String,
  duration: { type: Number, required: true },
  genre: String,
  audioUrl: { type: String, required: true },
  coverUrl: String,
  description: String,
  plays: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  tags: [String],
  language: String,
  explicit: { type: Boolean, default: false },
  trackNumber: Number,
  lyrics: String,
}, { timestamps: true });

export const Song = mongoose.model<ISong>('Song', songSchema);
