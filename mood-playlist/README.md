# 🎵 Mood Playlist Curator

A React web app that turns your mood into a Spotify playlist. Describe how you're feeling in plain text and get 10 matching tracks instantly.

## Features

- 🧠 Mood parser — maps your text to music energy, valence, danceability and tempo
- 🎵 Spotify Catalog mode — pulls tracks from matching artists and genres
- ❤️ Liked Songs mode — shuffles from your own saved songs
- 🔐 Spotify PKCE OAuth — no backend, fully client-side auth
- 🎧 In-app 30s previews for each track
- ▶️ One-click open in Spotify

## Tech Stack

- React (Create React App)
- Spotify Web API
- PKCE Authorization Code Flow
- Axios

## Getting Started

### 1. Clone the repo
git clone https://github.com/yourusername/mood-playlist.git
cd mood-playlist

### 2. Install dependencies
npm install

### 3. Set up Spotify credentials
Create a .env file in the root:

REACT_APP_SPOTIFY_CLIENT_ID=your_client_id_here
REACT_APP_SPOTIFY_CLIENT_SECRET=your_client_secret_here
REACT_APP_REDIRECT_URI=http://127.0.0.1:3000/callback

Get your credentials from https://developer.spotify.com/dashboard
Make sure to add http://127.0.0.1:3000/callback as a Redirect URI in your Spotify app settings.

### 4. Run the app
npm start

Open http://127.0.0.1:3000 in your browser.
Use 127.0.0.1:3000 not localhost:3000 — Spotify's new URI rules (enforced April 2025) require this.

## Mood Examples

| Mood Input                    | Artists Picked              |
|-------------------------------|-----------------------------|
| "late night drive, nostalgic" | Frank Ocean, Joji           |
| "heartbroken, cant stop crying"| SZA, Billie Eilish         |
| "gym, beast mode, hype"       | Drake, Kendrick Lamar       |
| "rainy day, cozy inside"      | Bon Iver, Phoebe Bridgers   |
| "summer beach road trip"      | Tame Impala, Harry Styles   |
| "focus, deep work, coding"    | Lofi Girl, Nujabes          |
| "romantic, falling in love"   | Daniel Caesar, H.E.R.       |
| "angry, frustrated, bitter"   | Linkin Park, Kendrick Lamar |

## Project Structure

src/
  App.js           - Root component, handles Spotify OAuth flow
  App.css          - All styles
  Player.js        - Main UI, mood input, track results, mood parser
  spotify.js       - PKCE auth helpers
  index.js         - React entry point
  index.css        - Base styles
.env               - Your Spotify credentials (not committed)
.env.example       - Template for credentials

## How It Works

1. User logs in via Spotify PKCE OAuth (no backend needed)
2. User types a mood description in free text
3. parseMood() maps keywords to Spotify audio feature targets
4. App searches Spotify by artist name and genre
5. Results are deduplicated and shuffled into a 10-track playlist
6. User can preview 30s clips or open any track directly in Spotify

## Notes

- Spotify /recommendations and /audio-features endpoints are restricted for new apps
  This app uses search-based track discovery instead
- Playlist saving requires Spotify quota extension approval
  Use the play button to open tracks in Spotify and save manually
- App is in Spotify development mode — only whitelisted users can log in
  Add users under your app's Users and Access tab on the Spotify Developer Dashboard

## Author

Gurucharan — ECE Student & hobby dev
Built with React + Spotify Web API
