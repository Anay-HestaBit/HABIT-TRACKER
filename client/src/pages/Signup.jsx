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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
      const data = await signup(formData);
      setRegistrationSuccess(true);
      setSuccessMessage(data.message || 'Registration successful! Please check your email to verify your account.');
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
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <Link to="/" className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 mb-6 group transition-transform hover:scale-105 active:scale-95">
            <Globe2 className="text-white" size={32} />
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">
            {registrationSuccess ? 'Check Your Inbox' : 'Create Your World'}
          </h1>
          <p className="text-muted-foreground font-medium">
            {registrationSuccess 
              ? "We've sent a verification link to your email."
              : "Join thousands of users building healthier lives in 3D."
            }
          </p>
        </div>

        <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          {registrationSuccess ? (
            <div className="py-6 text-center space-y-6">
               <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto">
                 <Check className="text-emerald-500 w-10 h-10" />
               </div>
               <p className="text-foreground/80 font-medium leading-relaxed">
                 {successMessage}
               </p>
               <button 
                 onClick={() => navigate('/login')}
                 className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg shadow-xl shadow-white/5 hover:translate-y-[-2px] transition-all"
               >
                 Go to Login
               </button>
            </div>
          ) : (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Username</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-2 px-1">
                  <ValidationItem label="8+ chars" passed={validation.length} />
                  <ValidationItem label="Number" passed={validation.number} />
                  <ValidationItem label="Uppercase" passed={validation.upperCase} />
                  <ValidationItem label="Special char" passed={validation.special} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-3 px-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-3 px-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg shadow-xl shadow-white/5 hover:translate-y-[-2px] hover:shadow-white/10 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0 mt-4"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    Sign Up Free
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
        
        {!registrationSuccess && (
          <p className="mt-8 text-center text-muted-foreground font-medium">
            Already a citizen?{' '}
            <Link to="/login" className="text-primary hover:text-accent transition-colors font-bold">Log In</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Signup;
