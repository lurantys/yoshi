import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { SpotifyProvider, useSpotify } from './contexts/SpotifyContext';
import Callback from './components/Callback';
import Header from './components/Header';
import WelcomeSection from './components/WelcomeSection';
import MainInput from './components/MainInput';
import SuggestionCards from './components/SuggestionCards';
import Footer from './components/Footer';

// List of valid Spotify genres (partial, can be expanded)
const SPOTIFY_GENRES = [
  "pop", "rock", "hip-hop", "indie", "electronic", "jazz", "classical", "country", "metal", "blues", "folk", "punk", "soul", "reggae", "funk", "disco", "house", "techno", "trance", "k-pop", "r-n-b", "alternative", "edm", "latin", "gospel", "opera", "blues-rock", "hard-rock", "progressive-house", "singer-songwriter", "soundtrack", "world-music"
];

function MainAppContent() {
  const [prompt, setPrompt] = useState('');
  const [playlistSize, setPlaylistSize] = useState(20);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { spotifyApi, user, isAuthenticated } = useSpotify();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyApi.TrackObjectFull[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState<'loading' | 'done' | null>(null);

  function buildGptPrompt({ prompt, playlistSize, selectedImage }: { prompt: string, playlistSize: number, selectedImage: string | null }) {
    return `
CRITICAL INSTRUCTIONS: You are generating a Spotify playlist for a user.

THEME: "${prompt}"
${selectedImage ? 'Use the attached image as inspiration.' : ''}
PLAYLIST SIZE: ${playlistSize} songs

REQUIREMENTS:
- ONLY include real, popular songs that fit the user's theme above.
- DO NOT include generic, random, or unrelated mainstream songs. Every song must fit the theme and user requirements.
- ONLY include songs that are available and playable on Spotify in the United States.
- DO NOT invent or make up any song or artist names. If you are unsure, only include well-known, popular tracks by established artists that fit the theme.
- If you cannot find enough real songs, return fewer songs rather than inventing any.
- DO NOT include any commentary, explanations, extra text, code blocks, JSON, headings, or formatting other than the list below.
- DO NOT use quotes, parentheses, or any extra formatting—just the song title and artist.

OUTPUT FORMAT (MANDATORY):
1. Song Title - Artist
2. Song Title - Artist
3. ...

WARNING: If you do not follow these instructions exactly, your output will be discarded.
ONLY output the numbered list as shown above, and nothing else.
`;
  }
  // Helper: Parse song list from AI response (ultra-strict, robust)
  function parseSongList(content: string): { title: string, artist: string }[] {
    const lines = content.split('\n');
    const songs: { title: string, artist: string }[] = [];
    for (const line of lines) {
      // 1. Song Title - Artist
      let m = line.match(/^\s*\d+\.\s*([^\-]+?)\s*-\s*([^\-]+?)\s*$/);
      if (m) {
        songs.push({ title: m[1].trim(), artist: m[2].trim() });
        continue;
      }
      // 1. Song Title by Artist
      m = line.match(/^\s*\d+\.\s*([^\-]+?)\s*by\s*([^\-]+?)\s*$/i);
      if (m) {
        songs.push({ title: m[1].trim(), artist: m[2].trim() });
        continue;
      }
      // 1. Artist: Song Title
      m = line.match(/^\s*\d+\.\s*([^:]+):\s*([^\-]+?)\s*$/);
      if (m) {
        songs.push({ title: m[2].trim(), artist: m[1].trim() });
        continue;
      }
      // 1. Song Title – Artist (en dash)
      m = line.match(/^\s*\d+\.\s*([^–]+?)\s*–\s*([^–]+?)\s*$/);
      if (m) {
        songs.push({ title: m[1].trim(), artist: m[2].trim() });
        continue;
      }
      // Ignore all other lines (commentary, descriptions, etc.)
    }
    if (songs.length === 0) {
      // Fallback: Try to extract any line with ' - ' and two non-empty fields, ignoring lines with parentheses, quotes, or more than one dash
      const fallback: { title: string, artist: string }[] = [];
      for (const line of lines) {
        // Only match lines with a single ' - ' and no parentheses/quotes
        if (line.includes('(') || line.includes(')') || line.includes('"') || line.split(' - ').length !== 2) continue;
        const [title, artist] = line.split(' - ');
        if (title && artist && title.trim().length > 0 && artist.trim().length > 0) {
          fallback.push({ title: title.trim(), artist: artist.trim() });
        }
      }
      if (fallback.length > 0) {
        console.log('Fallback Parsed Songs:', fallback);
        return fallback;
      }
      // Fallback 2: lines like '"Song Title" by Artist'
      const byFormat: { title: string, artist: string }[] = [];
      for (const line of lines) {
        const m = line.match(/^\s*\d*\.?\s*"?(.+?)"?\s+by\s+(.+)$/i);
        if (m) {
          byFormat.push({ title: m[1].trim().replace(/^"|"$/g, ''), artist: m[2].trim().replace(/^"|"$/g, '') });
        }
      }
      if (byFormat.length > 0) {
        console.log('By-format Parsed Songs:', byFormat);
        return byFormat;
      }
      // Fallback 3: block pairs Song: ... Artist: ...
      const blockFormat: { title: string, artist: string }[] = [];
      let temp: { title?: string, artist?: string } = {};
      for (const line of lines) {
        let m = line.match(/song:?\s*"?(.+?)"?$/i);
        if (m) { temp.title = m[1].trim(); continue; }
        m = line.match(/title:?\s*"?(.+?)"?$/i);
        if (m) { temp.title = m[1].trim(); continue; }
        m = line.match(/artist:?\s*"?(.+?)"?$/i);
        if (m) { temp.artist = m[1].trim(); }
        if (temp.title && temp.artist) {
          blockFormat.push({ title: temp.title, artist: temp.artist });
          temp = {};
        }
      }
      if (blockFormat.length > 0) {
        console.log('Block-format Parsed Songs:', blockFormat);
        return blockFormat;
      }
      // Fallback 4: Try to parse a JSON array
      try {
        const jsonMatch = content.match(/\[\s*{[\s\S]*?}\s*\]/);
        if (jsonMatch) {
          const arr = JSON.parse(jsonMatch[0]);
          if (Array.isArray(arr) && arr.every(o => o.title && o.artist)) {
            console.log('JSON-array Parsed Songs:', arr);
            return arr.map(o => ({ title: o.title, artist: o.artist }));
          }
        }
      } catch (e) { /* ignore */ }
      // If all fail, return []
      console.log('No songs could be parsed from any fallback.');
      return [];
    }
    return songs;
  }

  async function createSpotifyPlaylist(trackIds: string[], playlistName = "AI Generated Playlist") {
    if (!isAuthenticated || !user) {
      setLoading(false);
      alert("You must be logged in to Spotify.");
      return;
    }
    try {
      // 1. Create a new playlist
      const playlist = await spotifyApi.createPlaylist(user.id, {
        name: playlistName,
        description: "Generated by AI",
        public: false,
      });
      // 2. Add tracks to the playlist
      const uris = trackIds.map((id: string) => `spotify:track:${id}`);
      await spotifyApi.addTracksToPlaylist(playlist.id, uris);
      setLoading(false);
      alert("Playlist created successfully!");
      window.open(playlist.external_urls.spotify, "_blank");
    } catch (error) {
      setLoading(false);
      console.error("Failed to create playlist:", error);
      alert("Failed to create playlist. See console for details.");
    }
  }

  // Helper: Search Spotify for a track by title and artist
  async function getRealSpotifyTrackId(title: string, artist: string): Promise<string | null> {
    // Ensure the access token is set before every call
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      spotifyApi.setAccessToken(token);
    } else {
      console.warn('No Spotify access token found.');
      return null;
    }
    try {
      const query = `track:${title} artist:${artist}`;
      const result = await spotifyApi.searchTracks(query, { limit: 1 });
      if (result.tracks.items.length > 0) {
        return result.tracks.items[0].id;
      }
    } catch (e) {
      console.warn(`Spotify search failed for ${title} - ${artist}`);
    }
    return null;
  }

  // --- NEW: Entity Extraction with OpenRouter ---
  async function extractEntitiesFromPrompt(userPrompt: string) {
    const extractionPrompt = `Extract any artist names, song titles, and keywords from this sentence. Return as JSON.\nOutput ONLY the JSON. Do not add any commentary, explanation, or extra text before or after the JSON.\n{\n  \"artists\": [],\n  \"songs\": [],\n  \"keywords\": []\n}\nSentence: \"${userPrompt}\"`;
    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: extractionPrompt }]
      })
    });
    const data = await response.json();
    if (!data.choices || !Array.isArray(data.choices) || !data.choices[0]?.message?.content) {
      console.error('Hack Club AI error or no choices:', data);
      return { artists: [], songs: [], keywords: [] };
    }
    let text = data.choices[0].message.content;
    if (!text || typeof text !== 'string') {
      console.error('LLM output is empty or not a string:', text);
      return { artists: [], songs: [], keywords: [] };
    }
    console.log('LLM raw output:', text);
    try {
      // Find the largest JSON object (greedy)
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const cleaned = match[0].replace(/,(\s*[}\]])/g, '$1');
        return JSON.parse(cleaned);
      }
      // If no match, try to parse the whole text (may work if it's pure JSON)
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse LLM JSON:', e, text);
      return { artists: [], songs: [], keywords: [] };
    }
  }

  // --- NEW: Validate Entities with Spotify ---
  async function validateEntitiesWithSpotify(entities: { artists: string[], songs: string[], keywords: string[] }, accessToken: string) {
    if (!accessToken) {
      alert('You must be logged in to Spotify.');
      return { artistIds: [], trackIds: [], genres: [] };
    }
    spotifyApi.setAccessToken(accessToken);
    // Validate artists
    const artistIds: string[] = [];
    for (const artist of entities.artists) {
      try {
        const res = await spotifyApi.searchArtists(artist, { limit: 5 });
        // Only use the artist whose name matches exactly (case-insensitive)
        const found = res.artists.items.find(a =>
          a.name.toLowerCase() === artist.toLowerCase()
        );
        if (found) {
          // Verify the artist ID is valid by fetching the artist
          try {
            await spotifyApi.getArtist(found.id);
            artistIds.push(found.id);
          } catch {
            console.warn(`Artist ID ${found.id} is not valid on Spotify.`);
          }
        } else {
          console.warn(`No exact match found for artist: ${artist}`);
        }
      } catch {}
    }
    // Validate songs
    const trackIds: string[] = [];
    for (const song of entities.songs) {
      try {
        const res = await spotifyApi.searchTracks(song, { limit: 1 });
        if (res.tracks.items.length > 0) {
          trackIds.push(res.tracks.items[0].id);
        }
      } catch {}
    }
    // Only use keywords that are valid Spotify genres (case-insensitive)
    const genres = entities.keywords.filter(kw =>
      SPOTIFY_GENRES.includes(kw.toLowerCase())
    );
    return { artistIds, trackIds, genres };
  }

  // --- NEW: Get Recommendations from Spotify ---
  async function getRecommendationsFromSpotify(seeds: { artistIds: string[], trackIds: string[], genres: string[] }, playlistSize: number, accessToken: string) {
    if (!accessToken) {
      alert('You must be logged in to Spotify.');
      return [];
    }
    spotifyApi.setAccessToken(accessToken);
    // Build seeds (Spotify allows up to 5 total seeds)
    const params: any = {
      limit: playlistSize,
    };
    if (seeds.artistIds.length > 0) params.seed_artists = seeds.artistIds[0]; // Use only the first artist
    if (seeds.trackIds.length > 0) params.seed_tracks = seeds.trackIds.slice(0, 2).join(',');
    if (seeds.genres.length > 0) params.seed_genres = seeds.genres.slice(0, 1).join(',');
    // If no seeds, fallback to a random valid genre
    if (!params.seed_artists && !params.seed_tracks && !params.seed_genres) {
      const fallbackGenres = ['pop', 'rock', 'hip-hop', 'indie', 'electronic'];
      params.seed_genres = fallbackGenres[Math.floor(Math.random() * fallbackGenres.length)];
    }
    try {
      const res = await spotifyApi.getRecommendations(params);
      if (res.tracks && res.tracks.length > 0) {
        return res.tracks;
      } else {
        // Fallback: try again with only a random genre
        const fallbackGenres = ['pop', 'rock', 'hip-hop', 'indie', 'electronic'];
        const fallbackGenre = fallbackGenres[Math.floor(Math.random() * fallbackGenres.length)];
        console.warn('No tracks found for seeds, retrying with fallback genre:', fallbackGenre);
        const fallbackRes = await spotifyApi.getRecommendations({ limit: playlistSize, seed_genres: fallbackGenre });
        return fallbackRes.tracks || [];
      }
    } catch (e) {
      // Log the error object; for full details, check the network tab in dev tools
      console.error('Spotify API error:', e, '(Check network tab for full response)');
      return [];
    }
  }

  // --- NEW: Orchestrate the full flow ---
  async function generatePlaylistFromEntities(userPrompt: string, playlistSize: number) {
    setLoading(true);
    setShowModal(true);
    setModalState('loading');
    const accessToken = localStorage.getItem('spotify_access_token');
    if (!accessToken) {
      setLoading(false);
      alert('You must be logged in to Spotify.');
      return;
    }
    try {
      // 1. Extract entities
      const entities = await extractEntitiesFromPrompt(userPrompt);
      console.log('Extracted entities:', entities);
      // 2. Validate with Spotify
      const seeds = await validateEntitiesWithSpotify(entities, accessToken);
      console.log('Validated seeds:', seeds);
      // 3. Get recommendations
      const tracks = await getRecommendationsFromSpotify(seeds, playlistSize, accessToken);
      if (!tracks || tracks.length === 0) {
        setLoading(false);
        alert('No tracks found for your prompt. Try a different theme or prompt.');
        return;
      }
      // 4. Create playlist
      await createSpotifyPlaylist(tracks.map(t => t.id), `AI Playlist: ${userPrompt.slice(0, 30)}`);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert('An error occurred during playlist generation.');
      console.error(e);
    }
  }

  // Helper: Call the LLM (Hack Club AI or OpenRouter)
  async function callLLM(prompt: string): Promise<string> {
    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    if (!data.choices || !Array.isArray(data.choices) || !data.choices[0]?.message?.content) {
      throw new Error('LLM did not return a valid response');
    }
    return data.choices[0].message.content;
  }

  // 1. When the user submits a theme, prompt the LLM to generate a playlist
  async function generatePlaylistFromTheme(theme: string, playlistSize: number = 10) {
    setLoading(true);
    setShowModal(true);
    setModalState('loading');
    setError(null);
    setPlaylistUrl(null);
    setPlaylistTracks([]);
    setPlaylistName("");

    let foundTracks = [];
    let allTriedSongs = new Set();
    let lastParsed = [];
    let lastPrompt = "";
    let lastLLMOutput = "";
    let attempt = 0;
    const maxAttempts = 3;
    while (foundTracks.length < playlistSize && attempt < maxAttempts) {
      let avoidList = Array.from(allTriedSongs).map(s => `- ${s}`).join("\n");
      let avoidSection = avoidList && attempt > 0 ? `\nAVOID THESE SONGS (already tried or not found on Spotify):\n${avoidList}\n` : "";
      const prompt = `
You are an expert Spotify playlist curator and musicologist.

THEME: "${theme}"
${avoidSection}
INSTRUCTIONS:
- ONLY include real, popular songs that are genuinely similar in style, mood, and genre to the user's theme or reference artist(s).
- If the user prompt references an artist, ALL songs must be by that artist or by artists with a very similar sound, era, or genre. For example, if the user asks for "songs similar to Taylor Swift," do NOT include random pop songs—only Taylor Swift or artists with a very similar style (e.g., Olivia Rodrigo, Sabrina Carpenter, Maisie Peters, Gracie Abrams, etc.).
- DO NOT include generic, unrelated, or mainstream songs unless they fit the theme or similarity requirement.
- ONLY include songs that are available and playable on Spotify in the United States.
- DO NOT invent or make up any song or artist names. If you are unsure, only include well-known, popular tracks by established artists that fit the theme.
- If you cannot find enough real songs, return fewer songs rather than inventing any.
- DO NOT include any commentary, explanations, extra text, code blocks, JSON, headings, or formatting other than the list below.
- DO NOT use quotes, parentheses, or any extra formatting—just the song title and artist.

OUTPUT FORMAT (MANDATORY):
1. Song Title - Artist
2. Song Title - Artist
3. ...

WARNING: If you do not follow these instructions exactly, your output will be discarded.
ONLY output the numbered list as shown above, and nothing else.
Return exactly ${playlistSize} songs if possible.
`;
      lastPrompt = prompt;
      let llmOutput = "";
      try {
        llmOutput = await callLLM(prompt);
        lastLLMOutput = llmOutput;
        console.log("LLM raw output (attempt", attempt + 1, "):", llmOutput);
      } catch (e) {
        setError("AI failed to generate a playlist. Please try again.");
        setLoading(false);
        setShowModal(false);
        setModalState(null);
        return;
      }

      // Parse the LLM output into song/artist pairs
      const parsed = parseSongList(llmOutput);
      lastParsed = parsed;
      if (!parsed || parsed.length === 0) {
        attempt++;
        continue;
      }

      // Search Spotify for each song/artist and collect track IDs (respect playlistSize)
      for (const { title, artist } of parsed) {
        const key = `${title} - ${artist}`;
        if (foundTracks.length >= playlistSize) break;
        if (allTriedSongs.has(key)) continue;
        allTriedSongs.add(key);
        try {
          const res = await spotifyApi.searchTracks(`track:${title} artist:${artist}`, { limit: 1 });
          if (res.tracks.items.length > 0) {
            foundTracks.push(res.tracks.items[0]);
          }
        } catch {}
      }
      attempt++;
    }

    if (foundTracks.length < playlistSize) {
      setError(`Could not find enough real songs on Spotify after ${maxAttempts} attempts. Only found ${foundTracks.length} out of ${playlistSize}. Try a different theme or rephrase your prompt.`);
      setLoading(false);
      setShowModal(false);
      setModalState(null);
      return;
    }

    // Create a playlist in the user's Spotify account
    let playlistId = "";
    let playlistName = `AI Playlist: ${theme}`;
    try {
      const user = await spotifyApi.getMe();
      const playlist = await spotifyApi.createPlaylist(user.id, { name: playlistName, public: false });
      playlistId = playlist.id;
      await spotifyApi.addTracksToPlaylist(playlistId, foundTracks.slice(0, playlistSize).map(t => t.uri));
      setPlaylistUrl(playlist.external_urls.spotify);
      setPlaylistTracks(foundTracks.slice(0, playlistSize));
      setPlaylistName(playlistName);
      setModalState('done');
    } catch (e) {
      setError("Failed to create playlist in your Spotify account. Please try again.");
      setLoading(false);
      setShowModal(false);
      setModalState(null);
      return;
    }

    setLoading(false);
  }

  // --- OLD: LLM playlist generation (commented out) ---
  // async function callOpenRouter(
  //   gptPrompt: string,
  //   alreadyFound: string[] = [],
  //   alreadyTried: Set<string> = new Set(),
  //   playlistName = "AI Generated Playlist",
  //   retryCount = 0
  // ): Promise<any> {
  //   ...
  // }

  // --- Use new flow in handleGeneratePlaylist ---
  const handleGeneratePlaylist = async () => {
    if (!prompt.trim()) return;
    await generatePlaylistFromTheme(prompt, playlistSize);
  };

  // Modal animation styles
  const modalStyles = `
    .ai-modal-overlay {
      opacity: 0;
      transition: opacity 0.35s cubic-bezier(.4,0,.2,1);
    }
    .ai-modal-overlay.ai-modal-open {
      opacity: 1;
    }
    .ai-modal-popup {
      opacity: 0;
      transform: scale(0.92) translateY(20px);
      transition: opacity 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1);
    }
    .ai-modal-popup.ai-modal-open {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    .ai-modal-close-btn {
      transition: all 0.2s ease;
    }
    .ai-modal-close-btn:hover {
      transform: scale(1.05);
    }
  `;

  // Modal popup for loading/done
  const renderModal = () => {
    if (!showModal || !modalState) return null;
    return (
      <>
        <style>{modalStyles}</style>
        <div className={`ai-modal-overlay${showModal ? ' ai-modal-open' : ''} fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center`}
        >
          <div className={`ai-modal-popup${showModal ? ' ai-modal-open' : ''} bg-white dark:bg-zinc-900 text-black dark:text-white rounded-2xl w-[340px] h-[340px] shadow-2xl flex flex-col items-center justify-center p-0 relative`}
          >
            {modalState === 'loading' && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <img src="/loading.gif" alt="Loading..." className="block mb-4 max-w-full max-h-[120px]" />
                <div className="font-semibold text-xl text-center">Generating your playlist...</div>
              </div>
            )}
            {modalState === 'done' && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <img src="/done.gif" alt="Done!" className="block mb-4 max-w-full max-h-[120px]" />
                <div className="font-semibold text-xl mb-2 text-center">Playlist created!</div>
                <button
                  className="ai-modal-close-btn mt-2 px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold border-none cursor-pointer text-base transition-all duration-200"
                  onClick={() => { setShowModal(false); setModalState(null); }}
                >Close</button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {renderModal()}
      <div className="flex flex-col min-h-screen bg-primary">
        <Header />
        <main className="flex-grow flex flex-col justify-center">
          <WelcomeSection />
          <MainInput 
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleGeneratePlaylist}
            playlistSize={playlistSize}
            onPlaylistSizeChange={setPlaylistSize}
            selectedImage={selectedImage}
            onImageChange={setSelectedImage}
          />
          <SuggestionCards onSuggestionClick={setPrompt} />
        </main>
        <Footer />
      </div>
    </>
  );
}

function App() {
  const isCallback = window.location.pathname === '/callback' || 
    window.location.hash.includes('access_token');

  return (
    <ThemeProvider>
      <SpotifyProvider>
        {isCallback ? (
          <Callback />
        ) : (
          <MainAppContent />
        )}
      </SpotifyProvider>
    </ThemeProvider>
  );
}

export default App;
