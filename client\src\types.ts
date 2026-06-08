export type SongStatus = 'draft' | 'published' | 'archived';

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistImageUrl?: string;
  albumId?: string;
  albumTitle?: string;
  duration: number;
  genre?: string;
  audioUrl: string;
  coverUrl?: string;
  description?: string;
  plays: number;
  status: SongStatus;
  likes?: number;
  tags?: string[];
  language?: string;
  explicit?: boolean;
  trackNumber?: number;
  lyrics?: string;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  spotify?: string;
  appleMusic?: string;
  soundcloud?: string;
  facebook?: string;
}

export interface Artist {
  id: string;
  name: string;
  fullName?: string;
  bio?: string;
  imageUrl?: string;
  genre?: string;
  country?: string;
  dateOfBirth?: string;
  recordLabel?: string;
  website?: string;
  socialLinks?: SocialLinks;
  whatILove?: string;
  albums?: Album[];
  topSongs?: Song[];
}

export interface ArtistReport {
  period: string;
  totalPlays: number;
  totalPeriodLikes: number;
  songsCreated: number;
  totalSongs: number;
  topSongs: {
    id: string;
    title: string;
    plays: number;
    likes: number;
    periodLikes: number;
    createdAt: string;
  }[];
}

export interface ArtistDashboard {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  genre?: string;
  albums: Album[];
  songs: Song[];
}

export interface Album {
  id: string;
  title: string;
  artistId?: string;
  artistName?: string;
  artistImageUrl?: string;
  coverUrl?: string;
  releaseYear: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  userId: string;
  isPublic: boolean;
  songCount: number;
  songs?: Song[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  displayName: string;
  avatarUrl?: string;
  gender?: string;
  createdAt?: string;
}
