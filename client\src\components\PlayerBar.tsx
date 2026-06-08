import { SkipBack, SkipForward, Play, Pause, Volume2, Info } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PlayerBar({ onOpenSongDetail }: { onOpenSongDetail?: () => void }) {
  const { currentSong, isPlaying, progress, volume, togglePlay, next, prev, seek, setVolume } = usePlayer();

  if (!currentSong) return null;

  const duration = currentSong.duration;
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setVolume(pct);
  };

  return (
    <div className="col-span-full grid grid-cols-[1fr_auto] sm:grid-cols-3 items-center px-2 sm:px-4 bg-surface-secondary border-t border-surface-elevated h-[80px]">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div
          className="w-10 h-10 sm:w-14 sm:h-14 rounded flex items-center justify-center text-lg sm:text-2xl shrink-0 bg-cover bg-center"
          style={{ background: currentSong.coverUrl ? `url(${currentSong.coverUrl})` : '#555' }}
        >
          {!currentSong.coverUrl && '♫'}
        </div>
        <div className="overflow-hidden">
          <div className="font-semibold text-xs sm:text-sm truncate">{currentSong.title}</div>
          <div className="text-text-secondary text-[11px] sm:text-xs">{currentSong.artistName}</div>
        </div>
        <button onClick={onOpenSongDetail} className="p-1.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-elevated transition shrink-0" title="View song details">
          <Info size={14} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 col-span-full sm:col-span-1">
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="text-text-secondary hover:text-text-primary transition p-1" onClick={prev}><SkipBack size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
          <button
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent text-white flex items-center justify-center hover:brightness-110 transition-transform hover:scale-105"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={14} className="sm:w-[16px] sm:h-[16px]" fill="currentColor" /> : <Play size={14} className="sm:w-[16px] sm:h-[16px]" fill="currentColor" />}
          </button>
          <button className="text-text-secondary hover:text-text-primary transition p-1" onClick={next}><SkipForward size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-xs sm:max-w-lg">
          <span className="text-[10px] sm:text-xs text-text-subdued min-w-[28px] sm:min-w-[35px] text-right tabular-nums">{formatTime(progress)}</span>
          <input
            type="range" min={0} max={duration || 100} value={progress}
            onChange={e => seek(Number(e.target.value))}
            className="flex-1"
            style={{ background: `linear-gradient(to right, #fff 0%, #fff ${progressPct}%, #555 ${progressPct}%, #555 100%)` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end min-w-0">
        <Volume2 size={15} className="text-text-secondary shrink-0" />
        <div className="relative w-20 sm:w-24 h-1 rounded-full cursor-pointer group" onClick={handleVolumeChange}
          style={{ background: `linear-gradient(to right, #fff 0%, #fff ${volume * 100}%, #555 ${volume * 100}%, #555 100%)` }}
        />
      </div>
    </div>
  );
}
