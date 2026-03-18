import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Camera, Save, Loader2, Info } from 'lucide-react';
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-secondary/60 text-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full border-4 border-blue-500/30 overflow-hidden bg-secondary">
                  {user?.profilePicUrl ? (
                    <img src={user.profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-6 text-muted-foreground" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-all"
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
              <h2 className="text-xl font-bold text-foreground mb-1">{user?.fullName}</h2>
              <p className="text-muted-foreground text-sm mb-4">@{user?.username}</p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-blue-400 font-bold">{user?.level}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Level</p>
                </div>
                <div className="w-[1px] h-8 bg-secondary" />
                <div className="text-center">
                  <p className="text-emerald-400 font-bold">{user?.xp}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total XP</p>
                </div>
              </div>
            </div>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-secondary/60">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-secondary/50 border border-secondary/60 p-3 pl-11 rounded-xl text-foreground focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full bg-secondary/50 border border-secondary/60 p-3 pl-11 rounded-xl text-foreground focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Gender</label>
                <div className="flex gap-4">
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
                      <div className="text-center p-3 rounded-xl border border-secondary/60 bg-secondary/50 text-muted-foreground peer-checked:border-blue-500 peer-checked:text-blue-400 peer-checked:bg-blue-500/10 cursor-pointer transition-all capitalize">
                        {g}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Bio</label>
                <div className="relative">
                  <Info className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                  <textarea
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full bg-secondary/50 border border-secondary/60 p-3 pl-11 rounded-xl text-foreground focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
