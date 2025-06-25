import React from 'react';
import ThemeToggle from './ThemeToggle';
import UserProfile from './UserProfile';

const Header: React.FC = () => {
  return (
    <header className="py-4 px-6 md:px-12 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src="/yoshi.png" alt="Yoshi Logo" className="w-8 h-8" />
        <h1 className="text-xl font-bold text-text-primary">Yoshi</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <UserProfile />
      </div>
    </header>
  );
};

export default Header; 