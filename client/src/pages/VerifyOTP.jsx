import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const email = location.state?.email;

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Allow backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const otpString = otp.join('');
      await verifyOtp(email, otpString);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-secondary/50"
      >
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-blue-400" />
          </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-center text-muted-foreground">
            We sent a 6-digit code to{' '}
            <span className="text-blue-400 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                className="w-12 h-14 bg-secondary/50 border border-secondary/60 text-center text-2xl font-bold text-foreground rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                value={data}
                onChange={e => handleChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-rose-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-primary-foreground font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Verify & Sign In'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-muted-foreground text-sm">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:underline font-medium"
          >
            Go back and try again
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;