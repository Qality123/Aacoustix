import { useState, useEffect } from 'react';

export function RedirectLoader() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center">
      <div className="text-text-primary text-2xl font-mono tracking-widest font-bold">
        Loading<span className="inline-block w-8 text-left">{dots}</span>
      </div>
    </div>
  );
}
