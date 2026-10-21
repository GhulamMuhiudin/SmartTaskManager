// ============================================
// Profile Page — User Settings & Security
// ============================================
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, dashboardAPI } from '../api';

function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        authAPI.getProfile(),
        dashboardAPI.getStats(),
      ]);
      if (profileRes.data?.data) {
        setProfile({
          name: profileRes.data.data.name || '',
          email: profileRes.data.data.email || '',
          avatar_url: profileRes.data.data.avatar_url || '',
        });
      }
      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({
        name: profile.name,
        email: profile.email,
      });
      updateUser(res.data.data);
      showToast('Profile information updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await authAPI.updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully! 🔐');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Profile & Settings</h1>
        <p className="text-surface-400 mt-1">Manage your account information and security preferences</p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-surface-900 rounded-full" title="Active" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-white">{profile.name || 'User'}</h2>
            <span className="self-center sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Personal Account
            </span>
          </div>
          <p className="text-sm text-surface-400 mt-1">{profile.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-surface-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Member since {memberSince}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Verified Email
            </span>
          </div>
        </div>

        {/* Quick Highlights */}
        {stats && (
          <div className="flex sm:flex-col gap-4 border-t sm:border-t-0 sm:border-l border-surface-700/50 pt-4 sm:pt-0 sm:pl-6 text-center sm:text-right">
            <div>
              <p className="text-xs text-surface-400 uppercase font-medium">Completed</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.completed_tasks || 0}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400 uppercase font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-indigo-400">{stats.completion_rate || 0}%</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information Form */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">General Information</h3>
              <p className="text-xs text-surface-400">Update your name and primary email address</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input-field"
                placeholder="e.g. Ali Khan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="input-field"
                placeholder="e.g. ali@example.com"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password & Security Form */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Change Password</h3>
              <p className="text-xs text-surface-400">Ensure your account remains safe with a strong password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input-field"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="Repeat new password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="btn-secondary w-full flex items-center justify-center gap-2 hover:border-purple-500/50"
              >
                {passwordLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Database & Infrastructure Info Card */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-2">Connected Infrastructure</h3>
        <p className="text-xs text-surface-400 mb-4">
          All data is actively secured and synchronized with your local PostgreSQL database instance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-surface-800/40 border border-surface-700/40">
            <p className="text-surface-500 font-medium">Database Engine</p>
            <p className="text-white font-semibold text-sm mt-0.5">PostgreSQL 18</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-800/40 border border-surface-700/40">
            <p className="text-surface-500 font-medium">Authentication</p>
            <p className="text-white font-semibold text-sm mt-0.5">JWT & Bcrypt Salted</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-800/40 border border-surface-700/40">
            <p className="text-surface-500 font-medium">Status</p>
            <p className="text-emerald-400 font-semibold text-sm mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
              Connected & Healthy
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'border-red-500/30' : 'border-emerald-500/30'}`}>
          <p className={`text-sm font-medium ${toast.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}

export default Profile;
