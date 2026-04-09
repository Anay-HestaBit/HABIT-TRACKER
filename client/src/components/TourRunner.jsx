import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import api from '../api/axios';

const TourRunner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tourStarted = useRef(false);

  useEffect(() => {
    if (user && !user.hasCompletedTour && !tourStarted.current && location.pathname === '/dashboard') {
      tourStarted.current = true;

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
            onNext: () => {
              navigate('/world');
              setTimeout(() => {
                d.moveNext();
              }, 600); // 600ms delay to allow Framer Motion's page unmount/mount animation
            }
          },
          { element: '#tour-world-scene', popover: { title: 'Your Digital Evolution', description: 'This world tree dynamically levels up, grows branches, and blooms flowers as you earn XP!' } },
          { 
            popover: { title: 'Secure Journals 🔒', description: 'Next, let\'s set up your private Daily Reflections.' },
            onNext: () => {
              navigate('/reflections');
              setTimeout(() => {
                d.moveNext();
              }, 600);
            }
          },
          { element: '#tour-journal-lock', popover: { title: 'End-to-End Encryption', description: 'All journal entries are securely encrypted in our database using AES-256 GCM. Because of this, you must set an independent Journal Password to read or write entries.' } },
          { 
            popover: { title: 'Back Home 🏠', description: 'Let\'s go back to the dashboard to wrap up.' },
            onNext: () => {
              navigate('/dashboard');
              setTimeout(() => {
                d.moveNext();
              }, 600);
            }
          },
          { element: '#tour-sidebar', popover: { title: 'Command Center', description: 'Access settings, the user guide, and all other features securely from the sidebar. You are all set to start tracking!' } }
        ],
        onDestroyed: () => {
          api.patch('/users/tour').then(() => {
            user.hasCompletedTour = true;
          });
        }
      });
      setTimeout(() => d.drive(), 800); // Add initial slight delay to let Dashboard cleanly mount on initial route
    }
  }, [user, navigate, location.pathname]);

  return null;
};

export default TourRunner;
