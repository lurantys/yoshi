import React from 'react';
import ThemeToggle from './ThemeToggle';
import SpotifyIcon from './SpotifyIcon';

const Header: React.FC = () => {
  return (
    <header className="py-4 px-6 md:px-12 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src="/yoshi.png" alt="Yoshi Logo" className="w-8 h-8" />
        <h1 className="text-xl font-bold text-text-primary">Yoshi</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-accent text-white hover:opacity-90 transition-opacity">
          <SpotifyIcon className="w-5 h-5" />
          Login with Spotify
        </button>
      </div>
    </header>
  );
};

export default Header; 