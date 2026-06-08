import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useLikedSongs() {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get<string[]>('/likes')
      .then(res => setLikedIds(new Set(res.data)))
      .catch(() => {});
  }, []);

  const toggleLike = useCallback(async (songId: string) => {
    const isLiked = likedIds.has(songId);
    try {
      if (isLiked) {
        await api.delete(`/likes/${songId}`);
        setLikedIds(prev => { const n = new Set(prev); n.delete(songId); return n; });
      } else {
        await api.post(`/likes/${songId}`, {});
        setLikedIds(prev => { const n = new Set(prev); n.add(songId); return n; });
      }
    } catch {}
  }, [likedIds]);

  return { likedIds, toggleLike, isLiked: (id: string) => likedIds.has(id) };
}
