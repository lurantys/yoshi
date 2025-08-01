import React from 'react';
import { useSpotify } from '../contexts/SpotifyContext';

const SpotifyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={className} viewBox="0 0 16 16">
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/>
  </svg>
);

const LoginButton: React.FC = () => {
  const { login, loading } = useSpotify();

  return (
    <button
      onClick={login}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:bg-green-400 shadow"
      style={{ minWidth: 180 }}
    >
      <SpotifyIcon className="w-5 h-5" />
      {loading ? 'Connecting...' : 'Login with Spotify'}
    </button>
  );
};

export default LoginButton; 