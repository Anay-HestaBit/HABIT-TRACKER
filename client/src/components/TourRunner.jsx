import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import api from '../api/axios';

const waitForElement = (selector, timeoutMs = 5000) => new Promise((resolve) => {
  const start = Date.now();
  const check = () => {
    if (document.querySelector(selector)) {
      resolve(true);
      return;
    }

    if (Date.now() - start >= timeoutMs) {
      resolve(false);
      return;
    }

    window.requestAnimationFrame(check);
  };

  check();
});

const TourRunner = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tourStarted = useRef(false);

  useEffect(() => {
    if (user && !user.hasCompletedTour && !tourStarted.current && location.pathname === '/dashboard') {
      tourStarted.current = true;

      const markTourCompleted = () => {
        api.patch('/users/tour')
          .then(() => {
            setUser(prev => (prev ? { ...prev, hasCompletedTour: true } : prev));
          })
          .catch(() => {
            // Non-blocking: tour completion sync can be retried on next session.
          });
      };

      const d = driver({
        showProgress: true,
        animate: true,
        popoverClass: 'driverjs-theme',
        allowClose: true, 
        steps: [
          { popover: { title: 'Welcome to Habitcraft! 🌍', description: 'Your ultimate gamified journey starts here. Let us take a quick tour.' } },
          { element: '#tour-new-habit', popover: { title: 'Create Habits', description: 'Begin your journey by creating daily habits up here.' } },
          { element: '#tour-stats', popover: { title: 'Track Stats', description: 'Monitor your XP, streaks, and dynamically unlocked achievements.' } },
          { element: '#tour-consistency', popover: { title: 'Consistency', description: 'Keep the heatmap completely glowing by completing habits every day.' } },
          { 
            popover: { title: 'Visual World 🌳', description: 'Let\'s head over to the Visual World to see how your habits physically manifest.' },
            onNextClick: async () => {
              navigate('/world');
              await waitForElement('#tour-world-scene');
              d.moveNext();
            }
          },
          { element: '#tour-world-scene', popover: { title: 'Your Digital Evolution', description: 'This world tree dynamically levels up, grows branches, and blooms flowers as you earn XP!' } },
          { 
            popover: { title: 'Secure Journals 🔒', description: 'Next, let\'s set up your private Daily Reflections.' },
            onNextClick: async () => {
              navigate('/reflections');
              await waitForElement('#tour-journal-lock');
              d.moveNext();
            }
          },
          { element: '#tour-journal-lock', popover: { title: 'End-to-End Encryption', description: 'All journal entries are securely encrypted in our database using AES-256 GCM. Because of this, you must set an independent Journal Password to read or write entries.' } },
          { 
            popover: { title: 'Back Home 🏠', description: 'Let\'s go back to the dashboard to wrap up.' },
            onNextClick: async () => {
              navigate('/dashboard');
              await waitForElement('#tour-new-habit');
              d.moveNext();
            }
          },
          {
            element: window.innerWidth >= 1024 ? '#tour-sidebar' : undefined,
            popover: {
              title: 'Command Center',
              description: 'Access settings, the user guide, and all other features from your menu. You are all set to start tracking!'
            },
            onNextClick: () => {
              markTourCompleted();
              d.destroy();
            },
          }
        ],
      });

      waitForElement('#tour-new-habit', 5000).then(() => d.drive());
    }
  }, [user, navigate, location.pathname, setUser]);

  return null;
};

export default TourRunner;
