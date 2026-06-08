import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic2, ArrowLeft, Cake, Building2, Link, Heart, User, ArrowRight, Check, ChevronLeft, Globe } from 'lucide-react';
import { api } from '../api/client';
import { StepIndicator } from '../components/StepIndicator';
import { RedirectLoader } from '../components/RedirectLoader';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe',
];

const GENRES = ['Electronic', 'Jazz', 'Classical', 'Afrobeat', 'Synthwave', 'Pop', 'Rock', 'Hip Hop', 'R&B', 'Indie'];

const steps = [
  { label: 'Basic Info', icon: <User size={14} /> },
  { label: 'Details', icon: <Cake size={14} /> },
  { label: 'Social & Bio', icon: <Heart size={14} /> },
];

export function BecomeArtist() {
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [genre, setGenre] = useState('');
  const [country, setCountry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [recordLabel, setRecordLabel] = useState('');
  const [website, setWebsite] = useState('');
  const [socialLinks, setSocialLinks] = useState({ instagram: '', twitter: '', youtube: '', spotify: '', appleMusic: '', soundcloud: '', facebook: '' });
  const [whatILove, setWhatILove] = useState('');
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!redirecting) return;
    const timer = setTimeout(() => navigate('/artist-dashboard', { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [redirecting]);

  const updateSocial = (key: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 0 && !name.trim()) {
      setError('Artist name is required');
      return;
    }
    setError('');
    setStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError('');
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const cleanedSocial: Record<string, string> = {};
      for (const [k, v] of Object.entries(socialLinks)) {
        if (v.trim()) cleanedSocial[k] = v.trim();
      }
      await api.post('/artists', {
        name, fullName: fullName || undefined, bio, genre: genre || undefined,
        country: country || undefined, dateOfBirth: dateOfBirth || undefined,
        recordLabel: recordLabel || undefined, website: website || undefined,
        socialLinks: Object.keys(cleanedSocial).length > 0 ? cleanedSocial : undefined,
        whatILove: whatILove || undefined,
      });
      setRedirecting(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create artist account');
    }
  };

  if (redirecting) return <RedirectLoader />;

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-16 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="form-card relative rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Mic2 size={28} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Become an Artist</h1>
            <p className="text-text-secondary text-sm">Complete your profile step by step</p>
          </div>
        </div>

        {error && (
          <div className="text-text-primary text-sm mb-6 p-3 bg-white/10 rounded-lg border border-white/20">
            {error}
          </div>
        )}

        <StepIndicator steps={steps} currentStep={step} />

        <form onSubmit={handleSubmit}>
          {step === 0 && (
            <div className="step-content">
              <div className="section-label">Basic Information</div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-1.5 block">
                    Artist Name <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <Mic2 size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-subdued" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your stage name"
                      className="input-line pl-6" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-1.5 block">Full Legal Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-subdued" />
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your real name"
                      className="input-line pl-6" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-1.5 block">Genre</label>
                  <div className="tag-select">
                    {GENRES.map(g => (
                      <button key={g} type="button" onClick={() => setGenre(genre === g ? '' : g)}
                        className={`tag-option ${genre === g ? 'active' : ''}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-1.5 block">Country</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-subdued" />
                    <select value={country} onChange={e => setCountry(e.target.value)}
                      className="input-line pl-6 appearance-none">
                      <option value="">Select your country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="step-content">
              <div className="section-label">Additional Details</div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-1.5 block">Date of Birth</label>
                  <div className="relative">
                    <Cake size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-subdued" />
                    <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="input-line pl-6" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-1.5 block">Record Label</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-subdued" />
                    <input type="text" value={recordLabel} onChange={e => setRecordLabel(e.target.value)}
                      placeholder="e.g. Universal, independent..."
                      className="input-line pl-6" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-1.5 block">Website</label>
                  <div className="relative">
                    <Link size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-subdued" />
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                      placeholder="https://yoursite.com"
                      className="input-line pl-6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="section-label">Social & Biography</div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-2.5 block">Social Links</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      { key: 'instagram', label: 'Instagram', icon: '📷' },
                      { key: 'twitter', label: 'Twitter / X', icon: '🐦' },
                      { key: 'youtube', label: 'YouTube', icon: '▶' },
                      { key: 'spotify', label: 'Spotify', icon: '🎧' },
                      { key: 'appleMusic', label: 'Apple Music', icon: '🍎' },
                      { key: 'soundcloud', label: 'SoundCloud', icon: '☁' },
                      { key: 'facebook', label: 'Facebook', icon: '📘' },
                    ].map(s => (
                      <div key={s.key}>
                        <label className="text-[11px] text-text-subdued block mb-0.5">{s.icon} {s.label}</label>
                        <input type="url" value={(socialLinks as any)[s.key]}
                          onChange={e => updateSocial(s.key, e.target.value)}
                          placeholder={`https://${s.key}.com/...`}
                          className="input-filled text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-1.5 block">What I Love / Influences</label>
                  <textarea value={whatILove} onChange={e => setWhatILove(e.target.value)} rows={2}
                    placeholder="Share your musical influences, what inspires you..."
                    className="input-filled resize-none" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-semibold mb-1.5 block">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                    placeholder="Tell us about yourself, your journey, and your music..."
                    className="input-filled resize-none" />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
            {step > 0 && (
              <button type="button" onClick={handleBack} className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button type="button" onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-1.5">
                <Check size={16} /> Create Artist Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
