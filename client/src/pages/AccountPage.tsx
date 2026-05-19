import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { updateMe, changePassword, deleteAccount, uploadImage } from '../api/users';
import { ApiError } from '../api/client';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useRef } from 'react';

export default function AccountPage() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      const updated = await updateMe({ displayName, username });
      updateUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      navigate('/login', { replace: true });
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  async function handleAvatarFile(file: File) {
    setAvatarUploading(true);
    try {
      const { url } = await uploadImage(file);
      const updated = await updateMe({ avatarUrl: url });
      updateUser(updated);
    } catch {
      // silently fail
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    try {
      const updated = await updateMe({ avatarUrl: null });
      updateUser(updated);
    } catch {
      // silently fail
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:px-8">
      <h1 className="text-xl font-semibold text-text mb-8">Account</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-20 h-20">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          {avatarUploading && (
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
          >
            Upload photo
          </Button>
          {user?.avatarUrl && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemoveAvatar}
              disabled={avatarUploading}
            >
              Remove photo
            </Button>
          )}
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleAvatarFile(file);
            e.target.value = '';
          }}
          className="hidden"
        />
      </div>

      {/* Profile */}
      <section className="bg-white rounded-2xl border border-black/8 p-5 mb-4">
        <h2 className="font-semibold text-text mb-4">Profile</h2>
        <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            required
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Email</label>
            <p className="text-sm text-text/50 px-1">{user?.email}</p>
          </div>
          {profileError && <p className="text-sm text-red-500">{profileError}</p>}
          {profileSuccess && <p className="text-sm text-secondary">Profile updated!</p>}
          <Button type="submit" loading={profileSaving} disabled={!displayName || !username}>
            Save changes
          </Button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white rounded-2xl border border-black/8 p-5 mb-4">
        <h2 className="font-semibold text-text mb-4">Change password</h2>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
          />
          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-secondary">Password changed!</p>}
          <Button
            type="submit"
            loading={passwordSaving}
            disabled={!currentPassword || newPassword.length < 8}
          >
            Change password
          </Button>
        </form>
      </section>

      {/* Sign out */}
      <section className="bg-white rounded-2xl border border-black/8 p-5 mb-4">
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="w-full"
        >
          Sign out
        </Button>
      </section>

      {/* Danger zone */}
      <section className="bg-red-50 rounded-2xl border border-red-100 p-5">
        <h2 className="font-semibold text-red-700 mb-2">Danger zone</h2>
        <p className="text-sm text-red-600/70 mb-4">
          Permanently delete your account and all your recipes.
        </p>
        <Button
          variant="danger"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete account
        </Button>
      </section>

      {showDeleteModal && (
        <Modal
          title="Delete account?"
          message="This will permanently delete your account and all your recipes. This cannot be undone."
          confirmLabel="Delete my account"
          confirmVariant="danger"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}
