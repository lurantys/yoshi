import React from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import LoginButton from './LoginButton';
import { Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSpotify();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-primary items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Connecting to Spotify...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-primary items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Welcome to Yoshi</h1>
            <p className="text-xl text-white/80">
              Connect your Spotify account to start creating amazing playlists
            </p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper; 