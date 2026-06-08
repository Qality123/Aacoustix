import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILike extends Document {
  userId: Types.ObjectId;
  songId: Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
  createdAt: { type: Date, default: Date.now },
});

likeSchema.index({ userId: 1, songId: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', likeSchema);
