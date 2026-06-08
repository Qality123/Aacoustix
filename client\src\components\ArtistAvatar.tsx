import { Mic2 } from 'lucide-react';

interface ArtistAvatarProps {
  imageUrl?: string;
  name?: string;
  className?: string;
  iconSize?: number;
}

export function ArtistAvatar({ imageUrl, className = '', iconSize = 36 }: ArtistAvatarProps) {
  return (
    <div
      className={`bg-cover bg-center flex items-center justify-center ${imageUrl ? '' : 'bg-surface-elevated'} ${className}`}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    >
      {!imageUrl && <Mic2 size={iconSize} />}
    </div>
  );
}
