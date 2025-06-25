# Yoshi - AI-Powered Playlist Generator

![Yoshi](https://www.pngkey.com/png/detail/9-93904_super-mario-yoshi-png.png)

Yoshi is an AI-powered playlist generator that connects with your Spotify account to create personalized playlists based on your mood and preferences.

## Features

- 🎵 **Spotify Integration** - Connect your Spotify account for seamless playlist creation
- 🤖 **AI-Powered** - Generate playlists based on mood, genre, or custom prompts
- 🎨 **Beautiful UI** - Modern, responsive design with dark/light theme support
- 🔐 **Secure Authentication** - OAuth 2.0 authentication with Spotify
- 👤 **User Profiles** - Display user information and manage account

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Spotify account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lurantys/yoshi.git
cd yoshi
```

2. Install dependencies:
```bash
npm install
```

3. Set up Spotify authentication (see [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md) for detailed instructions):
   - Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a `.env` file with your Spotify credentials

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Authentication Setup

For detailed instructions on setting up Spotify authentication, see [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md).

## Usage

1. **Connect with Spotify** - Click the "Connect with Spotify" button to authenticate
2. **Enter your mood** - Describe how you're feeling or what type of music you want
3. **Generate playlist** - Let Yoshi create a personalized playlist for you
4. **Save to Spotify** - Your generated playlist will be saved to your Spotify account

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Spotify API**: spotify-web-api-js
- **Authentication**: OAuth 2.0 with Spotify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
