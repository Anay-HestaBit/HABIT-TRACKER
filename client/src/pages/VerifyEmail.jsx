import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  // FIX: useRef guard ensures the verification API call fires EXACTLY once.
  // Even if verifyEmail's reference changes (which we also fixed in AuthContext),
  // this ref acts as a second safety net so the token is never consumed twice.
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return; // Already ran — do nothing
    hasVerified.current = true;      // Mark as ran before any async work

    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token found in the link.');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
          'Verification failed. The link may have expired — please sign up again.'
        );
      }
    };

    performVerification();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card/50 backdrop-blur-xl p-10 rounded-3xl border border-secondary/50 text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-14 h-14 text-blue-400 animate-spin" />
            <h2 className="text-2xl font-bold text-foreground">Verifying your email...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-emerald-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login in 3 seconds...</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all text-sm font-bold"
            >
              Go to Login Now
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <XCircle className="w-16 h-16 text-rose-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">Verification Failed</h2>
            <p className="text-muted-foreground">{message}</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all text-sm font-bold"
              >
                Sign Up Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-all text-sm font-bold"
              >
                Log In
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;