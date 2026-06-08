import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Mail, Phone, Headphones, Library, ListMusic, Volume2, Heart, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RedirectLoader } from '../components/RedirectLoader';

const FEATURES = [
  { icon: <Headphones size={20} />, title: 'Unlimited Streaming', desc: 'Access millions of songs, albums, and playlists from independent artists worldwide.' },
  { icon: <ListMusic size={20} />, title: 'Smart Playlists', desc: 'Personalized mixes and recommendations tailored to your unique taste.' },
  { icon: <Heart size={20} />, title: 'Save Favourites', desc: 'Build your library of loved songs, follow artists, and never miss a release.' },
  { icon: <Library size={20} />, title: 'Your Library', desc: 'Organize your music your way — create playlists, save albums, curate collections.' },
  { icon: <Volume2 size={20} />, title: 'High Quality Audio', desc: 'Crystal clear sound with support for high-fidelity streaming on all devices.' },
  { icon: <Shield size={20} />, title: 'Ad-Free Experience', desc: 'Listen without interruptions. Pure music, pure focus, anytime anywhere.' },
];

export function Login() {
  const [useEmail, setUseEmail] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!redirecting) return;
    const timer = setTimeout(() => navigate('/home', { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [redirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(useEmail ? email : phone, password);
      setRedirecting(true);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  if (redirecting) return <RedirectLoader />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-surface to-surface-secondary p-4">
      <div className="flex w-full max-w-4xl bg-surface overflow-hidden shadow-2xl">
        {/* Left: Marketing */}
        <div className="hidden md:flex flex-col w-1/2 bg-gradient-to-br from-accent/5 to-surface-elevated p-10 justify-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-accent mb-8">
            <Music size={28} /> Aacoustix
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4 leading-tight">Discover music<br />that moves you.</h1>
          <p className="text-text-secondary mb-10 leading-relaxed">
            Join millions of listeners exploring independent artists, curated playlists, and personalised radio. Your next favourite song is waiting.
          </p>
          <div className="space-y-5">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-3">
                <div className="shrink-0 mt-0.5 text-accent">{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{f.title}</p>
                  <p className="text-xs text-text-secondary">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="md:hidden flex items-center justify-center gap-2 text-2xl font-bold text-accent mb-6">
            <Music size={28} /> Aacoustix
          </div>
          <h2 className="text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-text-secondary text-sm mb-6">Sign in to continue your journey.</p>
          {error && <div className="flex items-start gap-2 text-red-300 text-sm mb-3 p-3 bg-red-400/10 border border-red-400/20"><AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

          <div className="flex mb-5 bg-surface-elevated p-0.5">
            <button onClick={() => setUseEmail(true)} className={`flex-1 py-2 text-xs font-semibold transition ${useEmail ? 'bg-red-400 text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              <Mail size={14} className="inline mr-1" /> Email
            </button>
            <button onClick={() => setUseEmail(false)} className={`flex-1 py-2 text-xs font-semibold transition ${!useEmail ? 'bg-red-400 text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              <Phone size={14} className="inline mr-1" /> Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
            {useEmail ? (
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required={useEmail}
                className="p-3 bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
            ) : (
              <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} required={!useEmail}
                className="p-3 bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
            )}
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              className="p-3 bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
            <button type="submit" className="p-3 bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-transform hover:scale-[1.02]">
              Sign In
            </button>
          </form>
          <p className="text-text-secondary text-sm mb-3 text-center">
            Don't have an account? <Link to="/register" className="text-text-primary font-semibold hover:text-red-300">Sign up</Link>
          </p>
          <p className="text-text-subdued text-xs pt-3 border-t border-surface-elevated text-center">Demo: demo@music.com / demo123</p>
        </div>
      </div>
    </div>
  );
}
