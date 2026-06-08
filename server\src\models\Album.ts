import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAlbum extends Document {
  title: string;
  artistId: Types.ObjectId;
  artistName: string;
  coverUrl?: string;
  releaseYear: number;
}

const albumSchema = new Schema<IAlbum>({
  title: { type: String, required: true },
  artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  artistName: { type: String, required: true },
  coverUrl: String,
  releaseYear: Number,
});

export const Album = mongoose.model<IAlbum>('Album', albumSchema);
