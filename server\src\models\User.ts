import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  phone?: string;
  displayName: string;
  passwordHash: string;
  avatarUrl?: string;
  gender?: string;
  isVerified: boolean;
  googleId?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, unique: true, sparse: true, lowercase: true },
  phone: { type: String, unique: true, sparse: true },
  displayName: { type: String, required: true },
  passwordHash: { type: String, required: true },
  avatarUrl: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', userSchema);
