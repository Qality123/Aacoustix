import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, ShieldCheck, ShieldAlert, Headphones, Heart, ListMusic, Volume2, Music, Check, Loader, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RedirectLoader } from '../components/RedirectLoader';

function calcStrength(pw: string): { label: string; score: number; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score < 2) return { label: 'Weak', score: 1, color: '#888888' };
  if (score < 4) return { label: 'Medium', score: 2, color: '#666666' };
  return { label: 'Strong', score: 3, color: '#ffffff' };
}

const BENEFITS = [
  { icon: <Headphones size={18} />, text: 'Stream millions of songs from independent artists' },
  { icon: <Heart size={18} />, text: 'Save favourites, create playlists, follow artists' },
  { icon: <ListMusic size={18} />, text: 'Get smart mixes tailored to your taste' },
  { icon: <Volume2 size={18} />, text: 'High-quality audio, zero ads, pure focus' },
  { icon: <Music size={18} />, text: 'Join a community of music lovers worldwide' },
];

type Step = 'email' | 'code' | 'details';

export function Register() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [redirecting, setRedirecting] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!redirecting) return;
    const timer = setTimeout(() => navigate('/home', { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [redirecting]);

  const strength = useMemo(() => calcStrength(password), [password]);
  const pwMatch = password === confirmPassword;
  const pwTouched = confirmPassword.length > 0;

  const handleSendCode = async () => {
    if (!email.includes('@')) { setError('Valid email required'); return; }
    setError('');
    setSending(true);
    try {
      await api.post('/auth/send-verification', { email });
      setCodeSent(true);
      setStep('code');
      setCountdown(60);
      const timer = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; }), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 6) { setError('Enter the 6-digit code'); return; }
    setError('');
    setVerifying(true);
    try {
      const res = await api.post<{ verifyToken: string }>('/auth/verify-code', { email, code });
      setVerifyToken(res.data.verifyToken);
      setStep('details');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!pwMatch) { setError('Passwords do not match'); return; }
    if (strength.label === 'Weak') { setError('Password is too weak'); return; }
    try {
      await register({ email, password, confirmPassword, displayName, gender: gender || undefined, verifyToken });
      setRedirecting(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleGoogleSignUp = () => {
    const googleId = 'google_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const name = prompt('Enter your name:');
    if (!name) return;
    googleLogin({ email, displayName: name, googleId }).then(() => setRedirecting(true)).catch((err: any) => setError(err.message || 'Google sign-up failed'));
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
          <h1 className="text-3xl font-bold text-text-primary mb-4 leading-tight">Start your<br />music journey.</h1>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Create a free account and unlock a world of music. Discover, save, and share what moves you.
          </p>
          <div className="space-y-4">
            {BENEFITS.map(b => (
              <div key={b.text} className="flex items-center gap-3">
                <span className="shrink-0 text-accent">{b.icon}</span>
                <span className="text-sm text-text-primary">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="md:hidden flex items-center justify-center gap-2 text-2xl font-bold text-accent mb-6">
            <Music size={28} /> Aacoustix
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {(['email', 'code', 'details'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors ${step === s ? 'bg-red-400 text-white' : ['code', 'details'].includes(step) && i < ['email', 'code', 'details'].indexOf(step) ? 'bg-accent/50 text-white' : 'bg-surface-elevated text-text-subdued'}`}>
                  {['code', 'details'].includes(step) && i < ['email', 'code', 'details'].indexOf(step) ? <Check size={14} /> : i + 1}
                </div>
                {i < 2 && <div className={`w-6 h-0.5 ${['code', 'details'].includes(step) && i < ['email', 'code', 'details'].indexOf(step) ? 'bg-accent/50' : 'bg-surface-elevated'}`} />}
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-1">
            {step === 'email' ? 'Create account' : step === 'code' ? 'Check email' : 'Set up profile'}
          </h2>
          <p className="text-text-secondary text-sm mb-5">
            {step === 'email' ? 'Free access to millions of songs.' : step === 'code' ? `Enter the code sent to ${email}` : 'Almost done! Choose your details.'}
          </p>

          {error && <div className="flex items-start gap-2 text-red-300 text-sm mb-3 p-3 bg-red-400/10 border border-red-400/20"><AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

          {/* Step 1: Email */}
          {step === 'email' && (
            <div className="flex flex-col gap-4 mb-4">
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required
                className="p-3 bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
              <button onClick={handleSendCode} disabled={sending || !email}
                className="p-3 bg-accent text-white font-bold text-sm hover:bg-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <Loader size={16} className="animate-spin" /> : null}
                {sending ? 'Sending...' : codeSent ? 'Resend code' : 'Send verification code'}
              </button>
            </div>
          )}

          {/* Step 2: Code */}
          {step === 'code' && (
            <div className="flex flex-col gap-4 mb-4">
              <input type="text" placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required
                className="p-3 bg-surface-elevated text-text-primary text-lg tracking-[8px] text-center outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued placeholder:tracking-normal" />
              <button onClick={handleVerifyCode} disabled={verifying || code.length < 6}
                className="p-3 bg-accent text-white font-bold text-sm hover:bg-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                {verifying ? <Loader size={16} className="animate-spin" /> : null}
                {verifying ? 'Verifying...' : 'Verify code'}
              </button>
              <button onClick={() => { setStep('email'); setCode(''); setCodeSent(false); }}
                className="text-text-secondary text-xs hover:text-text-primary transition">
                Change email
              </button>
              {countdown > 0 ? (
                <p className="text-text-subdued text-xs text-center">Resend in {countdown}s</p>
              ) : (
                <button onClick={handleSendCode} disabled={sending}
                  className="text-red-300 text-xs hover:underline transition disabled:opacity-50 text-center">
                  Resend code
                </button>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
              <input type="text" placeholder="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} required
                className="p-3 bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />

              {/* Gender */}
              <div className="flex bg-surface-elevated p-0.5">
                {['', 'male', 'female', 'other'].map(g => (
                  <button type="button" key={g} onClick={() => setGender(g)}
                    className={`flex-1 py-2 text-xs font-semibold transition capitalize ${gender === g ? 'bg-red-400 text-white' : 'text-text-secondary hover:text-text-primary'}`}>
                    {g || 'Skip'}
                  </button>
                ))}
              </div>

              {/* Password */}
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full p-3 pr-10 bg-surface-elevated text-text-primary text-sm outline-none focus:outline-2 focus:outline-accent placeholder:text-text-subdued" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subdued hover:text-text-secondary">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 transition-colors ${i <= strength.score ? '' : 'bg-surface-elevated'}`}
                        style={i <= strength.score ? { backgroundColor: strength.color } : {}} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: strength.color }}>
                    {strength.label === 'Weak' && <ShieldAlert size={12} />}
                    {strength.label === 'Medium' && <Shield size={12} />}
                    {strength.label === 'Strong' && <ShieldCheck size={12} />}
                    {strength.label} password
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  className={`w-full p-3 pr-10 bg-surface-elevated text-text-primary text-sm outline-none placeholder:text-text-subdued transition-all ${pwTouched ? (pwMatch ? 'outline-2 outline-white' : 'outline-2 outline-white/30') : 'focus:outline-2 focus:outline-accent'}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subdued hover:text-text-secondary">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwTouched && (
                <p className={`text-xs text-left ${pwMatch ? 'text-text-primary' : 'text-text-primary'}`}>
                  {pwMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}

              <button type="submit" className="mt-1 p-3 bg-accent text-white font-bold text-sm hover:bg-accent-hover transition">
                Create Account
              </button>
            </form>
          )}

          {/* Divider + Google */}
          {step === 'email' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-surface-elevated" />
                <span className="text-xs text-text-subdued">or</span>
                <div className="flex-1 h-px bg-surface-elevated" />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <button onClick={handleGoogleSignUp} disabled={!email}
                  className="flex items-center justify-center gap-2 p-3 bg-surface-elevated text-text-primary text-sm font-semibold hover:bg-surface-highlight transition disabled:opacity-50">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Sign up with Google
                </button>
              </div>
            </>
          )}

          <p className="text-text-secondary text-sm text-center">
            Already have an account? <Link to="/login" className="text-text-primary font-semibold hover:text-red-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
