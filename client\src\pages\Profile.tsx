import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { User, Mail, Calendar, Music, ListMusic, Heart, VenusAndMars, Pencil, Camera, Check, X, Loader2 } from 'lucide-react';

export function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const startEditing = () => {
    setDisplayName(user.displayName);
    setGender(user.gender || '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('displayName', displayName.trim());
      formData.append('gender', gender);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.uploadPut<typeof user>('/auth/profile', formData);
      updateUser(res.data);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = avatarPreview || user.avatarUrl;

  return (
    <div>
      <div className="entity-header" style={{ background: 'linear-gradient(135deg, #111111, #000000)' }}>
        <div className="entity-header-content">
          <div className="relative shrink-0">
            <div
              className={`w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] rounded-full flex items-center justify-center text-4xl sm:text-6xl bg-cover bg-center shadow-[0_4px_60px_rgba(0,0,0,0.5)] bg-accent ${avatarSrc ? '' : ''}`}
              style={avatarSrc ? { backgroundImage: `url(${avatarSrc})` } : {}}
            >
              {!avatarSrc && (user.displayName[0]?.toUpperCase() || '?')}
            </div>
            {editing && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-surface-elevated text-text-primary p-1.5 sm:p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  <Camera size={14} className="sm:w-4 sm:h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest mb-2">Profile</p>
            {editing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-3xl sm:text-5xl font-bold mb-2 bg-transparent border-b-2 border-white/30 outline-none w-full pb-1"
                placeholder="Display name"
              />
            ) : (
              <h1 className="text-3xl sm:text-5xl font-bold mb-2 truncate">{user.displayName}</h1>
            )}
            <p className="text-text-secondary text-sm">{user.email || user.phone || ''}</p>
          </div>
          <div className="self-start mt-2">
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !displayName.trim()}
                  className="p-2 bg-white text-black rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="p-2 bg-white/20 text-text-primary rounded-full hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={startEditing}
                className="p-2 bg-white/20 text-text-primary rounded-full hover:bg-white/30 transition-colors"
                title="Edit profile"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {user.email && (
            <div className="bg-surface-secondary p-6 rounded-lg flex items-center gap-4">
              <Mail size={24} className="text-text-secondary" />
              <div>
                <div className="text-xs text-text-subdued uppercase tracking-wider">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
            </div>
          )}
          {user.phone && (
            <div className="bg-surface-secondary p-6 rounded-lg flex items-center gap-4">
              <Mail size={24} className="text-text-secondary" />
              <div>
                <div className="text-xs text-text-subdued uppercase tracking-wider">Phone</div>
                <div className="font-medium">{user.phone}</div>
              </div>
            </div>
          )}
          <div className="bg-surface-secondary p-6 rounded-lg flex items-center gap-4">
            <User size={24} className="text-text-secondary" />
            <div>
              <div className="text-xs text-text-subdued uppercase tracking-wider">Display Name</div>
              <div className="font-medium">{user.displayName}</div>
            </div>
          </div>
          <div className="bg-surface-secondary p-6 rounded-lg flex items-center gap-4">
            <VenusAndMars size={24} className="text-text-secondary" />
            <div>
              <div className="text-xs text-text-subdued uppercase tracking-wider">Gender</div>
              {editing ? (
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="bg-surface-secondary text-text-primary border border-white/20 rounded px-2 py-1 text-sm outline-none focus:border-accent"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="font-medium capitalize">{user.gender || 'Not set'}</div>
              )}
            </div>
          </div>
          {user.createdAt && (
            <div className="bg-surface-secondary p-6 rounded-lg flex items-center gap-4">
              <Calendar size={24} className="text-text-secondary" />
              <div>
                <div className="text-xs text-text-subdued uppercase tracking-wider">Joined</div>
                <div className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          )}
          <div className="bg-surface-secondary p-6 rounded-lg flex items-center gap-4">
            <Music size={24} className="text-text-secondary" />
            <div>
              <div className="text-xs text-text-subdued uppercase tracking-wider">Member</div>
              <div className="font-medium">Aacoustix User</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-elevated p-5 rounded-lg text-center cursor-pointer hover:bg-surface-highlight transition-colors">
            <ListMusic size={28} className="mx-auto mb-2 text-accent" />
            <div className="font-bold text-lg">0</div>
            <div className="text-text-secondary text-xs">Playlists</div>
          </div>
          <div className="bg-surface-elevated p-5 rounded-lg text-center cursor-pointer hover:bg-surface-highlight transition-colors">
            <Heart size={28} className="mx-auto mb-2 text-accent" />
            <div className="font-bold text-lg">0</div>
            <div className="text-text-secondary text-xs">Liked Songs</div>
          </div>
          <div className="bg-surface-elevated p-5 rounded-lg text-center cursor-pointer hover:bg-surface-highlight transition-colors">
            <MicIcon size={28} className="mx-auto mb-2 text-accent" />
            <div className="font-bold text-lg">0</div>
            <div className="text-text-secondary text-xs">Followed Artists</div>
          </div>
          <div className="bg-surface-elevated p-5 rounded-lg text-center cursor-pointer hover:bg-surface-highlight transition-colors">
            <Music size={28} className="mx-auto mb-2 text-accent" />
            <div className="font-bold text-lg">0</div>
            <div className="text-text-secondary text-xs">Total Plays</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
