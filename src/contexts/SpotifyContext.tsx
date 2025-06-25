import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

interface SpotifyContextType {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
  isAuthenticated: boolean;
  user: SpotifyApi.CurrentUsersProfileResponse | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi();

// Spotify App Configuration
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID || 'your-client-id-here';
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://127.0.0.1:3000/callback';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-top-read'
].join(' ');

// --- PKCE Helper Functions ---
function base64URLEncode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(buffer))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await window.crypto.subtle.digest('SHA-256', data);
}

function generateCodeVerifier(length = 128) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  for (let i = 0; i < length; i++) {
    verifier += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return verifier;
}

export const SpotifyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyApi.CurrentUsersProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkTokenValidity = useCallback(async () => {
    try {
      const userProfile = await spotifyApi.getMe();
      setUser(userProfile);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('spotify_access_token');
      setIsAuthenticated(false);
      setUser(null);
      setError('Session expired or invalid. Please log in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // --- PKCE Login ---
  const login = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = base64URLEncode(await sha256(codeVerifier));
    localStorage.setItem('spotify_code_verifier', codeVerifier);
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
    window.location.href = authUrl;
  };

  // --- Exchange Code for Token ---
  const exchangeCodeForToken = useCallback(async (code: string) => {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      setError('Login failed: Missing code verifier. Please try logging in again without refreshing or navigating away during the login process.');
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append('client_id', CLIENT_ID);
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', REDIRECT_URI);
      params.append('code_verifier', codeVerifier);
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const data = await response.json();
      if (data.access_token) {
        spotifyApi.setAccessToken(data.access_token);
        localStorage.setItem('spotify_access_token', data.access_token);
        setError(null);
        await checkTokenValidity();
        window.location.replace('/');
      } else {
        setError(data.error_description || 'Token exchange failed. Please try again.');
        console.error('Spotify token error response:', JSON.stringify(data, null, 2));
        throw new Error('No access token in response');
      }
    } catch (error) {
      setError('Token exchange failed. Please try again.');
      setLoading(false);
    }
  }, [checkTokenValidity]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      exchangeCodeForToken(code);
    } else {
      const token = localStorage.getItem('spotify_access_token');
      if (token) {
        spotifyApi.setAccessToken(token);
        checkTokenValidity();
      } else {
        setLoading(false);
      }
    }
  }, [exchangeCodeForToken, checkTokenValidity]);

  const logout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_code_verifier');
    spotifyApi.setAccessToken('');
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  const value: SpotifyContextType = {
    spotifyApi,
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    error
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-primary text-center">
        <div className="bg-white/10 p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Authentication Error</h2>
          <p className="mb-6 text-white">{error}</p>
          <button
            onClick={() => { setError(null); logout(); }}
            className="px-6 py-2 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
          >
            Retry Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = (): SpotifyContextType => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}; 