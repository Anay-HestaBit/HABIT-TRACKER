import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/users/me');
      await logout();
      setDeleteSuccess(true);
      setTimeout(() => navigate('/'), 1400);
    } catch (err) {
      console.error('Failed to delete account', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black mb-2">Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your account and preferences.</p>
      </header>

      <div className="max-w-3xl space-y-8">
        {/* Profile Section */}
        <section className="glass p-8 rounded-[2rem] border border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <UserIcon size={20} className="text-primary" />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">Full Name</p>
                <p className="font-semibold">{user?.fullName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">Username</p>
                <p className="font-semibold">@{user?.username}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">Age</p>
                <p className="font-semibold">{user?.age || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">Gender</p>
                <p className="font-semibold capitalize">{user?.gender || 'Prefer not to say'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Danger Zone */}
        <section className="glass p-8 rounded-[2rem] border border-destructive/20 bg-destructive/5">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} />
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Once you delete your account, there is no going back. All your habits, streaks, and world progress will be permanently removed.
          </p>
          
          {!showDeleteConfirm ? (
            <button 
              onClick={() => { setShowDeleteConfirm(true); setDeleteStep(1); setDeleteConfirmText(''); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-destructive text-primary-foreground font-bold hover:bg-destructive/90 transition-all"
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {deleteStep === 1 ? (
                <>
                  <p className="font-bold text-destructive">Are you absolutely sure?</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => setDeleteStep(2)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-destructive text-primary-foreground font-bold hover:bg-destructive/90 transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Type <span className="font-black text-foreground">DELETE</span> to confirm account removal.
                  </p>
                  <input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full bg-secondary/60 border border-secondary/70 rounded-xl px-4 py-3 text-foreground"
                    placeholder="DELETE"
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmText.trim() !== 'DELETE'}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-destructive text-primary-foreground font-bold hover:bg-destructive/90 transition-all disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      Delete My Account
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {deleteSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass p-8 rounded-3xl border border-white/10 text-center"
            >
              <h3 className="text-2xl font-black mb-2">Account Deactivated</h3>
              <p className="text-muted-foreground">Redirecting to landing page...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
