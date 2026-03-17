import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe2, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Loader2, Check, X } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    age: '',
    gender: 'prefer-not-to-say'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password validation
  const validation = {
    length: formData.password.length >= 8,
    upperCase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*]/.test(formData.password)
  };

  const isFormValid = formData.username && formData.fullName && formData.email && formData.age && Object.values(validation).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setIsLoading(true);

    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ label, passed }) => (
    <div className="flex items-center gap-2 text-xs font-semibold">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-destructive/10 text-muted-foreground'}`}>
        {passed ? <Check size={10} /> : <X size={10} />}
      </div>
      <span className={passed ? 'text-emerald-500/80' : 'text-muted-foreground'}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <Link to="/" className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 mb-6 group transition-transform hover:scale-105 active:scale-95">
            <Globe2 className="text-white" size={32} />
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Create Your World</h1>
          <p className="text-muted-foreground font-medium">
            Join thousands of users building <br /> healthier lives in 3D.
          </p>
        </div>

        <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3"
              >
                <AlertCircle size={18} />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Username</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="explorer_1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="25"
                    required
                    min="13"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                  >
                    <option value="prefer-not-to-say">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {/* Strength Meter */}
                <div className="grid grid-cols-2 gap-2 mt-3 px-1">
                  <ValidationItem label="8+ chars" passed={validation.length} />
                  <ValidationItem label="Uppercase" passed={validation.upperCase} />
                  <ValidationItem label="Number" passed={validation.number} />
                  <ValidationItem label="Special char" passed={validation.special} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg shadow-xl shadow-white/5 hover:translate-y-[-2px] hover:shadow-white/10 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-muted-foreground font-medium">
          Already a citizen?{' '}
          <Link to="/login" className="text-primary hover:text-accent transition-colors font-bold">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
