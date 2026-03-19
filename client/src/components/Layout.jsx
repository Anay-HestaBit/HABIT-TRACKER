import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart3, 
  Home, 
  PlusCircle, 
  Award, 
  Globe2, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, label, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/habits', icon: PlusCircle, label: 'My Habits' },
    { to: '/world', icon: Globe2, label: 'Visual World' },
    { to: '/progress', icon: BarChart3, label: 'Analytics' },
    { to: '/achievements', icon: Award, label: 'Trophies' },
    { to: '/reflections', icon: BookOpen, label: 'Journal' },
    { to: '/guide', icon: BookOpen, label: 'User Guide' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-secondary/50 p-6 glass sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Globe2 className="text-primary-foreground" size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Habitcraft
          </h1>
          <button 
            onClick={toggleTheme}
            className="ml-auto p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <SidebarLink 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to} 
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-secondary/50 space-y-4">
          <Link 
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-xl glass-light hover:bg-secondary/20 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold overflow-hidden relative">
              {user?.profilePicUrl ? (
                <img src={user.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Settings size={14} className="text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground">LVL {user?.level || 1} Seedling</p>
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass z-50 flex items-center justify-between px-6 border-b border-secondary/50">
        <div className="flex items-center gap-2">
          <Globe2 className="text-primary" size={24} />
          <span className="font-bold">Habitcraft</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-muted-foreground"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 bg-background z-[60] p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-10">
              <span className="font-bold text-xl">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-muted-foreground"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 space-y-4">
              {navItems.map((item) => (
                <SidebarLink 
                  key={item.to} 
                  {...item} 
                  active={location.pathname === item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>

            <button 
              onClick={handleLogout}
              className="mt-6 flex items-center gap-3 w-full px-4 py-4 rounded-xl text-destructive bg-destructive/5 font-medium"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-20 lg:pt-0 overflow-x-hidden min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
