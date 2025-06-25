# Spotify Authentication Setup

To use Spotify authentication in this app, you need to set up a Spotify application and configure environment variables.

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - App name: "Yoshi" (or any name you prefer)
   - App description: "AI-powered playlist generator"
   - Redirect URI: `http://localhost:3000/callback`
   - Website: `http://localhost:3000`
5. Accept the terms and create the app

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
REACT_APP_REDIRECT_URI=http://localhost:3000/callback
```

Replace `your_spotify_client_id_here` with the Client ID from your Spotify app dashboard.

## Step 3: Update Redirect URIs

In your Spotify app dashboard, make sure to add these redirect URIs:
- `http://localhost:3000/callback` (for development)
- `https://yourdomain.com/callback` (for production)

## Step 4: Start the Application

```bash
npm start
```

The app will now require Spotify authentication before users can access the main features.

## Features Added

- ✅ Spotify OAuth authentication
- ✅ User profile display with avatar and follower count
- ✅ Persistent login state (tokens stored in localStorage)
- ✅ Logout functionality
- ✅ Loading states during authentication
- ✅ Responsive design for mobile and desktop

## Security Notes

- This implementation uses the implicit grant flow for simplicity
- For production apps, consider implementing the authorization code flow with a backend server
- Tokens are stored in localStorage (consider using httpOnly cookies for better security in production) 