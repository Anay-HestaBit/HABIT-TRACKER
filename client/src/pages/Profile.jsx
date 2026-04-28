import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Camera, Save, Loader2, Info, ShieldCheck, BadgeCheck, Sparkles } from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: user?.age || '',
    gender: user?.gender || 'male',
    bio: user?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await api.put('/auth/profile', formData);
      setUser(data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/auth/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser({ ...user, profilePicUrl: data.profilePicUrl });
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const createdAt = user?.createdAt ? new Date(user.createdAt) : null;

  return (
    <div className="space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Account</p>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground font-display">Profile Studio</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Curate your public identity and keep your account details up to date.
          </p>
        </div>
        <div className="glass px-5 py-3 rounded-2xl border border-white/10 text-xs font-semibold text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-1 space-y-6"
        >
          <div className="glass p-6 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-sky-500/20" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-secondary border border-white/10">
                    {user?.profilePicUrl ? (
                      <img src={user.profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-6 text-muted-foreground" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-2xl shadow-lg"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground font-display">{user?.fullName}</h2>
                  <p className="text-sm text-muted-foreground">@{user?.username}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full">
                    <ShieldCheck size={12} /> Verified member
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-secondary/40 rounded-2xl p-4 border border-white/5">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Level</p>
                  <p className="text-2xl font-black text-foreground">{user?.level}</p>
                </div>
                <div className="bg-secondary/40 rounded-2xl p-4 border border-white/5">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Total XP</p>
                  <p className="text-2xl font-black text-foreground">{user?.xp}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-[2.5rem] border border-white/10">
            <h3 className="text-lg font-black mb-4">Account snapshot</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Mail size={14} /> Email</span>
                <span className="text-foreground font-semibold">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar size={14} /> Joined</span>
                <span className="text-foreground font-semibold">
                  {createdAt ? createdAt.toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><BadgeCheck size={14} /> Status</span>
                <span className="text-foreground font-semibold">Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2"
        >
          <div className="glass p-8 rounded-[2.5rem] border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex items-center gap-3">
                <Sparkles className="text-indigo-300" size={20} />
                <div>
                  <h3 className="text-xl font-black">Personal details</h3>
                  <p className="text-sm text-muted-foreground">Keep your profile crisp and current.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-secondary/50 border border-secondary/60 p-3 pl-11 rounded-2xl text-foreground focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full bg-secondary/50 border border-secondary/60 p-3 pl-11 rounded-2xl text-foreground focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {['male', 'female', 'other'].map((g) => (
                    <label key={g} className="flex-1">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                        className="hidden peer"
                      />
                      <div className="text-center p-3 rounded-2xl border border-secondary/60 bg-secondary/50 text-muted-foreground peer-checked:border-indigo-400 peer-checked:text-indigo-200 peer-checked:bg-indigo-500/10 cursor-pointer transition-all capitalize">
                        {g}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bio</label>
                <div className="relative">
                  <Info className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                  <textarea
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full bg-secondary/50 border border-secondary/60 p-3 pl-11 rounded-2xl text-foreground focus:border-indigo-400 outline-none transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <p className="text-xs text-muted-foreground">Max 200 characters.</p>
              </div>

              {message.text && (
                <div className={`p-4 rounded-2xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save changes
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
