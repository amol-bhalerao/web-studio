import { motion } from 'framer-motion';
import { KeyRound, Save, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { AdminUser } from '../api/types';
import { useApi } from '../context/ApiContext';

export function AccountPage() {
  const api = useApi();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const u = await api.me();
      setUser(u);
      setEmail(u.email);
      setDisplayName(u.display_name ?? '');
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setMsg(null);
    setErr(null);
    try {
      const u = await api.updateMe({
        email: email.trim(),
        display_name: displayName.trim() || null,
      });
      setUser(u);
      setMsg('Profile saved.');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Save failed');
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setErr('New passwords do not match');
      return;
    }
    setSavingPw(true);
    setMsg(null);
    setErr(null);
    try {
      await api.updatePassword({ current_password: currentPw, new_password: newPw });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setMsg('Password updated.');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Could not update password');
    } finally {
      setSavingPw(false);
    }
  }

  if (loading || !user) {
    return <p className="text-slate-400">{loading ? 'Loading…' : 'Could not load account.'}</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Account</h1>
        <p className="mt-1 text-sm text-slate-400">Signed in as {user.email}</p>
      </div>

      {msg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{msg}</div>
      )}
      {err && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>}

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(ev) => void saveProfile(ev)}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 ring-1 ring-slate-800/80"
      >
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <User className="h-5 w-5 text-indigo-400" />
          Profile
        </h2>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Display name</label>
          <input
            className="admin-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Email</label>
          <input
            type="email"
            className="admin-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="admin-btn-primary inline-flex items-center gap-2" disabled={savingProfile}>
          <Save className="h-4 w-4" />
          {savingProfile ? 'Saving…' : 'Save profile'}
        </button>
      </motion.form>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={(ev) => void savePassword(ev)}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 ring-1 ring-slate-800/80"
      >
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <KeyRound className="h-5 w-5 text-amber-400" />
          Password
        </h2>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Current password</label>
          <input
            type="password"
            className="admin-input"
            autoComplete="current-password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">New password</label>
          <input
            type="password"
            className="admin-input"
            autoComplete="new-password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            minLength={8}
          />
          <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Confirm new password</label>
          <input
            type="password"
            className="admin-input"
            autoComplete="new-password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
        </div>
        <button type="submit" className="admin-btn-primary inline-flex items-center gap-2" disabled={savingPw || !newPw}>
          {savingPw ? 'Updating…' : 'Update password'}
        </button>
      </motion.form>
    </div>
  );
}
