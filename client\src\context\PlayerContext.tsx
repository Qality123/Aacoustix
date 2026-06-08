import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import type { Song } from '../types';
import { api } from '../api/client';

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  progress: number;
  volume: number;
  play: (song: Song) => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const audioRef = useRef(new Audio());

  const updateAudio = useCallback((song: Song) => {
    const audio = audioRef.current;
    audio.src = song.audioUrl;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
    setProgress(0);

    api.get(`/songs/${song.id}`).catch(() => {});

    audio.ontimeupdate = () => setProgress(audio.currentTime);
    audio.onended = () => {
      const nextSong = queue[queue.findIndex(s => s.id === song.id) + 1];
      if (nextSong) {
        setCurrentSong(nextSong);
        updateAudio(nextSong);
        setQueue(prev => {
          const idx = prev.findIndex(s => s.id === song.id);
          return idx >= 0 ? [...prev.slice(idx + 1)] : prev;
        });
      } else {
        setIsPlaying(false);
      }
    };
  }, [queue, volume]);

  const play = useCallback((song: Song) => {
    setCurrentSong(song);
    setQueue(prev => {
      if (!prev.find(s => s.id === song.id)) return [...prev, song];
      return prev;
    });
    updateAudio(song);
  }, [updateAudio]);

  const playQueue = useCallback((songs: Song[], startIndex = 0) => {
    setQueue(songs);
    setCurrentSong(songs[startIndex]);
    updateAudio(songs[startIndex]);
  }, [updateAudio]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else if (currentSong) {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    const idx = currentSong ? queue.findIndex(s => s.id === currentSong.id) : -1;
    const nextIdx = idx + 1;
    if (nextIdx < queue.length) {
      setCurrentSong(queue[nextIdx]);
      updateAudio(queue[nextIdx]);
      setQueue(prev => prev.slice(nextIdx));
    } else {
      setIsPlaying(false);
    }
  }, [queue, currentSong, updateAudio]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;
    const idx = currentSong ? queue.findIndex(s => s.id === currentSong.id) : -1;
    if (idx > 0) {
      setCurrentSong(queue[idx - 1]);
      updateAudio(queue[idx - 1]);
    }
  }, [queue, currentSong, updateAudio]);

  const seek = useCallback((time: number) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const setVolume = useCallback((v: number) => {
    audioRef.current.volume = v;
    setVolumeState(v);
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong, queue, isPlaying, progress, volume,
      play, playQueue, togglePlay, next, prev, seek, setVolume,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
