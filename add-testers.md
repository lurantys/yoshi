# Quick Fix: Add Testers to Your Spotify App

## The Problem
Other users are getting a 403 error because your Spotify app is in "Development Mode" and only allows specific users.

## Quick Solution (5 minutes)

1. **Go to Spotify Developer Dashboard**
   - Visit: https://developer.spotify.com/dashboard
   - Log in with your Spotify account

2. **Select Your App**
   - Click on your app (probably named "Yoshi" or similar)

3. **Add Testers**
   - In the left sidebar, click "Users and Testers"
   - Click "Add New User"
   - Enter the Spotify email addresses of people you want to test with
   - Click "Add"

4. **Users Get Invited**
   - Each user will receive an email from Spotify
   - They need to click the link in the email to accept the invitation
   - After accepting, they can use your app

## Alternative: Make App Public

If you want anyone to use your app:

1. Go to "App Review" in your app dashboard
2. Click "Submit for Review"
3. Fill out the required information
4. Wait for Spotify's approval (can take days)

**Note:** For development/testing, adding testers is much faster than waiting for review.

## Test It

After adding testers:
1. Ask them to clear their browser cache/localStorage
2. Have them try logging in again
3. The 403 error should be gone!

## Common Issues

- **User doesn't receive email**: Check spam folder
- **User can't accept invitation**: Make sure they're logged into the correct Spotify account
- **Still getting 403**: User needs to accept the invitation first 