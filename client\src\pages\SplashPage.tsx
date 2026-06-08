import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SplashPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [dots, setDots] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    if (loading) return;

    doneRef.current = true;
    const timer = setTimeout(() => {
      navigate(user ? '/home' : '/login', { replace: true });
    }, 4000);

    return () => clearTimeout(timer);
  }, [loading, user]);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      <img src="/Aacoustix.png" alt="Aacoustix" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-white text-2xl font-mono tracking-widest font-bold">
        Loading<span className="inline-block w-8 text-left">{dots}</span>
      </div>
    </div>
  );
}
