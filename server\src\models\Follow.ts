import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFollow extends Document {
  userId: Types.ObjectId;
  artistId: Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  createdAt: { type: Date, default: Date.now },
});

followSchema.index({ userId: 1, artistId: 1 }, { unique: true });

export const Follow = mongoose.model<IFollow>('Follow', followSchema);
