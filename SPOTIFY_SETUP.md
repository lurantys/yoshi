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

## Step 4: Fix App Access Restrictions ⚠️ CRITICAL

**By default, your Spotify app is in "Development Mode" and only you can access it.** Other users will get a 403 error.

### Option A: Add Users as Testers (Recommended for Development)

1. Go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app
3. Go to "Users and Testers" in the left sidebar
4. Click "Add New User"
5. Enter the Spotify email addresses of users you want to test with
6. They will receive an email invitation to access your app

### Option B: Submit for Review (For Public Use)

1. Go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app
3. Go to "App Review" in the left sidebar
4. Click "Submit for Review"
5. Fill out the required information about your app
6. Wait for Spotify's approval (can take several days)

**Note:** For development and testing, Option A (adding testers) is much faster and easier.

## Step 5: Start the Application

```bash
npm start
```

The app will now require Spotify authentication before users can access the main features.

## Troubleshooting

### 403 Error / "Check sett" JSON Parse Error
If users get a 403 error or see "Check sett" in the console, it means:
1. The user is not added as a tester (if in Development Mode)
2. The app hasn't been approved for public use (if submitted for review)

**Solution:** Add the user as a tester in your Spotify Developer Dashboard.

### Token Validation Failed
If you see "Token validation failed: XMLHttpRequest", it usually means:
1. The access token has expired
2. The user doesn't have permission to access the app
3. The app configuration is incorrect

**Solution:** Clear localStorage and try logging in again, or add the user as a tester.

## Features Added

- ✅ Spotify OAuth authentication with PKCE
- ✅ User profile display with avatar and follower count
- ✅ Persistent login state (tokens stored in localStorage)
- ✅ Logout functionality
- ✅ Loading states during authentication
- ✅ Responsive design for mobile and desktop
- ✅ Error handling for authentication issues

## Security Notes

- This implementation uses PKCE (Proof Key for Code Exchange) for enhanced security
- For production apps, consider implementing the authorization code flow with a backend server
- Tokens are stored in localStorage (consider using httpOnly cookies for better security in production)
- Always add users as testers before sharing your development app 