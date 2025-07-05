import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const Callback: React.FC = () => {
  useEffect(() => {
    // The SpotifyContext will handle the authentication automatically
    // This component just shows a loading state
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-primary items-center justify-center">
      <div className="text-center space-y-4 bg-white dark:bg-zinc-900 border border-border-color dark:border-zinc-700 rounded-xl shadow-lg px-8 py-8">
        <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
        <h2 className="text-xl font-semibold text-text-primary dark:text-white">
          Connecting to Spotify...
        </h2>
        <p className="text-text-secondary dark:text-zinc-300">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
};

export default Callback; 