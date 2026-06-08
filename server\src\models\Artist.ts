import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IArtist extends Document {
  name: string;
  fullName?: string;
  bio?: string;
  imageUrl?: string;
  genre?: string;
  country?: string;
  dateOfBirth?: string;
  recordLabel?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
    appleMusic?: string;
    soundcloud?: string;
    facebook?: string;
  };
  whatILove?: string;
  userId?: Types.ObjectId;
}

const artistSchema = new Schema<IArtist>({
  name: { type: String, required: true },
  fullName: String,
  bio: String,
  imageUrl: String,
  genre: String,
  country: String,
  dateOfBirth: String,
  recordLabel: String,
  website: String,
  socialLinks: {
    instagram: String,
    twitter: String,
    youtube: String,
    spotify: String,
    appleMusic: String,
    soundcloud: String,
    facebook: String,
  },
  whatILove: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const Artist = mongoose.model<IArtist>('Artist', artistSchema);
