import React, { useState, useRef, useEffect } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import { LogOut, User } from 'lucide-react';
import LoginButton from './LoginButton';

const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useSpotify();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  if (!user) return null;

  return (
    <div
      className="relative flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-border-color dark:border-zinc-700 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
      ref={menuRef}
      onClick={() => setMenuOpen((open) => !open)}
      title="Account menu"
    >
      <div className="flex items-center gap-3">
        {user.images && user.images.length > 0 ? (
          <img
            src={user.images[0].url}
            alt={user.display_name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center"
          >
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <span
          className="ml-2 font-semibold text-base truncate max-w-[120px]"
          style={{ color: 'var(--text-primary)' }}
          title={user.display_name}
        >
          {user.display_name}
        </span>
      </div>
      {menuOpen && (
        <div className="absolute right-0 top-12 mt-2 w-44 border border-border-color dark:border-zinc-700 rounded-xl shadow-xl z-50 py-2 animate-fade-in text-black dark:text-white"
          style={{ background: 'white', backgroundColor: 'white', ...(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? { background: '#18181b', backgroundColor: '#18181b' } : {}) }}
        >
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-500 font-semibold hover:bg-accent hover:text-white transition-colors rounded-lg dark:hover:bg-zinc-800"
            style={{ fontFamily: 'inherit' }}
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 