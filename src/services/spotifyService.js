import axios from 'axios';
import { getAiRecommendations, getGeminiApiKey } from './aiService';
import { parseMood } from '../utils/moodParser';

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
let rawRedirectUri = process.env.REACT_APP_REDIRECT_URI || window.location.origin;
const redirectUri = rawRedirectUri.replace('localhost', '127.0.0.1');

const scopes = [
  'user-library-read',
  'user-top-read',
  'user-read-recently-played',
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-private',
  'user-read-email',
].join(' ');

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function redirectToSpotifyLogin() {
  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem('pkce_verifier', verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    show_dialog: 'true',
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem('pkce_verifier');
  if (!verifier) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json();
    if (data.access_token) {
      const expiresInMs = (data.expires_in || 3600) * 1000;
      const expiresAt = Date.now() + expiresInMs;
      localStorage.setItem('spotify_token', data.access_token);
      localStorage.setItem('spotify_token_expires_at', expiresAt.toString());
      localStorage.setItem('spotify_granted_scopes', data.scope || '');
      localStorage.removeItem('pkce_verifier');
      return data.access_token;
    }
  } catch (err) {
    console.error('Error exchanging code for token:', err);
  }
  return null;
}

export function getGrantedScopes() {
  return localStorage.getItem('spotify_granted_scopes') || '';
}

export function getStoredToken() {
  const token = localStorage.getItem('spotify_token');
  const expiresAt = localStorage.getItem('spotify_token_expires_at');
  if (!token) return null;
  if (expiresAt && Date.now() >= (parseInt(expiresAt, 10) - 60000)) {
    clearToken();
    return null;
  }
  return token;
}

export function clearToken() {
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_token_expires_at');
  localStorage.removeItem('pkce_verifier');
  localStorage.removeItem('spotify_granted_scopes');
}

export async function getCurrentUser(token) {
  try {
    const res = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (e) {
    if (e.response && e.response.status === 401) clearToken();
    return null;
  }
}

export async function getLikedTracks(token) {
  try {
    const res = await axios.get('https://api.spotify.com/v1/me/tracks', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 50 }
    });
    return (res.data.items || []).map(i => i.track).filter(Boolean);
  } catch (e) {
    console.warn('Could not fetch liked tracks:', e);
    return [];
  }
}

// User's On-Repeat Tracks (last 4 weeks)
export async function getOnRepeatTracks(token) {
  try {
    const res = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 50, time_range: 'short_term' }
    });
    return res.data.items || [];
  } catch (e) {
    console.warn('Could not fetch on-repeat tracks:', e);
    return [];
  }
}

// User's Frequently Played Artists (last 4 weeks)
export async function getFrequentArtists(token) {
  try {
    const res = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 40, time_range: 'short_term' }
    });
    return res.data.items || [];
  } catch (e) {
    console.warn('Could not fetch frequent artists:', e);
    return [];
  }
}

// User's Recently Played Tracks
export async function getRecentlyPlayed(token) {
  try {
    const res = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 50 }
    });
    return (res.data.items || []).map(i => i.track).filter(Boolean);
  } catch (e) {
    console.warn('Could not fetch recently played:', e);
    return [];
  }
}

// All-time Top Artists
export async function getTopArtists(token, timeRange = 'medium_term') {
  try {
    const res = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 40, time_range: timeRange }
    });
    return res.data.items || [];
  } catch (e) {
    console.warn(`Could not fetch top artists (${timeRange}):`, e);
    return [];
  }
}

// All-time Top Tracks
export async function getTopTracks(token, timeRange = 'medium_term') {
  try {
    const res = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 50, time_range: timeRange }
    });
    return res.data.items || [];
  } catch (e) {
    console.warn(`Could not fetch top tracks (${timeRange}):`, e);
    return [];
  }
}

// Fetch artist top tracks directly from Spotify
export async function getArtistTopTracks(token, artistId) {
  if (!artistId) return [];
  try {
    const res = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=from_token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.tracks || [];
  } catch {
    return [];
  }
}

// Fetch related artists for a given artist
export async function getRelatedArtists(token, artistId) {
  if (!artistId) return [];
  try {
    const res = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.artists || [];
  } catch {
    return [];
  }
}

// Fetch official Spotify Audio Features metrics for candidate tracks
export async function getTracksAudioFeatures(token, trackIds = []) {
  if (!trackIds.length) return new Map();
  const validIds = trackIds.filter(Boolean).slice(0, 100).join(',');
  try {
    const res = await axios.get(`https://api.spotify.com/v1/audio-features`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { ids: validIds }
    });
    const map = new Map();
    (res.data.audio_features || []).forEach(af => {
      if (af && af.id) map.set(af.id, af);
    });
    return map;
  } catch {
    return new Map();
  }
}

// Strict vibe compatibility checker to prevent mood contamination across ALL mood types
function isTrackCompatibleWithMood(track, userPrompt = '') {
  if (!track || !track.name) return false;
  const name = track.name.toLowerCase();
  const artists = (track.artists || []).map(a => a.name.toLowerCase()).join(' ');
  const prompt = (userPrompt || '').toLowerCase();

  const isParty = prompt.includes('party') || prompt.includes('banger') || prompt.includes('club') || prompt.includes('house') || prompt.includes('dance') || prompt.includes('fetty wap') || prompt.includes('item song') || prompt.includes('item songs') || prompt.includes('chikni') || prompt.includes('fevicol') || prompt.includes('munni') || prompt.includes('sheila') || prompt.includes('rap') || prompt.includes('hype') || prompt.includes('edm');
  const isAdhdOrAmbient = prompt.includes('adhd') || prompt.includes('brown noise') || prompt.includes('ambient') || prompt.includes('nature') || prompt.includes('river') || prompt.includes('wind');
  const isSad = prompt.includes('sad') || prompt.includes('heartbreak') || prompt.includes('crying') || prompt.includes('lonely') || prompt.includes('depressed') || prompt.includes('broken');

  if (isParty) {
    const forbiddenInParty = ['sad', 'lonely', 'heartbreak', 'cry', 'crying', 'acoustic', 'slow', 'lo-fi', 'lofi', 'sleep', 'ambient', 'quiet', 'meditation', 'lullaby', 'relax', 'piano', 'depressed', 'grief'];
    if (forbiddenInParty.some(k => name.includes(k) || artists.includes(k))) {
      return false;
    }
  }

  if (isAdhdOrAmbient) {
    const forbiddenInAdhd = ['rap', 'remix', 'feat', 'ft.', 'pop', 'hip hop', 'banger', 'party', 'dance', 'club', 'trap', 'drill', 'rock', 'metal'];
    if (forbiddenInAdhd.some(k => name.includes(k))) {
      return false;
    }
  }

  if (isSad) {
    const forbiddenInSad = ['party', 'club', 'house music', 'dance', 'banger', 'edm', 'turn up', 'workout', 'gym', 'sprint'];
    if (forbiddenInSad.some(k => name.includes(k) || artists.includes(k))) {
      return false;
    }
  }

  return true;
}

// Quality filter to remove spammy TikTok/phonk/slowed+reverb remixes unless requested
function isHighQualityTrack(track, userPrompt = '', excludedArtists = []) {
  if (!track || !track.name) return false;
  if (!isTrackCompatibleWithMood(track, userPrompt)) return false;

  const name = track.name.toLowerCase();
  const artists = (track.artists || []).map(a => a.name.toLowerCase()).join(' ');
  const prompt = (userPrompt || '').toLowerCase();

  if (excludedArtists.some(ex => artists.includes(ex.toLowerCase()))) {
    return false;
  }

  const isAdhdOrAmbient = prompt.includes('adhd') || prompt.includes('brown noise') || prompt.includes('ambient') || prompt.includes('nature') || prompt.includes('river') || prompt.includes('wind');

  const spamKeywords = [
    'phonk',
    'slowed',
    'reverb',
    'sped up',
    'speed up',
    'nightcore',
    'bass boosted',
    'brazilian phonk',
    'funk rj',
    'montagem',
    'automotivo',
    'tiktok version',
    'tiktok remix',
  ];

  for (const keyword of spamKeywords) {
    if (!prompt.includes(keyword) && !isAdhdOrAmbient) {
      if (name.includes(keyword) || artists.includes(keyword)) {
        return false;
      }
    }
  }
  return true;
}

// Acoustic Vector Distance Scoring using Spotify's Official Audio Analysis API
async function filterAndRankByAcousticVectors(token, tracks, targetFeatures, userPrompt) {
  if (!tracks.length) return [];
  const trackIds = tracks.map(t => t.id).filter(Boolean);
  const audioMap = await getTracksAudioFeatures(token, trackIds);

  const prompt = (userPrompt || '').toLowerCase();
  const isParty = prompt.includes('party') || prompt.includes('banger') || prompt.includes('club') || prompt.includes('house') || prompt.includes('dance') || prompt.includes('fetty wap') || prompt.includes('item song') || prompt.includes('item songs') || prompt.includes('chikni') || prompt.includes('fevicol') || prompt.includes('munni') || prompt.includes('sheila') || prompt.includes('rap') || prompt.includes('hype') || prompt.includes('edm');
  const isAdhdOrAmbient = prompt.includes('adhd') || prompt.includes('brown noise') || prompt.includes('ambient') || prompt.includes('nature') || prompt.includes('river') || prompt.includes('wind');
  const isSad = prompt.includes('sad') || prompt.includes('heartbreak') || prompt.includes('crying') || prompt.includes('lonely') || prompt.includes('depressed');

  const scoredTracks = tracks.map(track => {
    const af = audioMap.get(track.id);
    let similarityScore = 0.5;

    if (af) {
      // Hard acoustic bounds enforcement
      if (isParty) {
        if (af.energy < 0.50 || af.danceability < 0.50) return null; // reject slow/acoustic tracks for party
      }
      if (isAdhdOrAmbient) {
        if (af.energy > 0.45 || af.danceability > 0.55) return null; // reject high energy / party / heavy vocal tracks for ADHD study
      }
      if (isSad) {
        if (af.energy > 0.70 || af.valence > 0.70) return null; // reject high energy / happy tracks for sad mood
      }

      // Compute Vector Similarity Score
      const targetV = targetFeatures.valence ?? 0.5;
      const targetE = targetFeatures.energy ?? 0.5;
      const targetD = targetFeatures.danceability ?? 0.5;

      const deltaV = Math.pow(af.valence - targetV, 2);
      const deltaE = Math.pow(af.energy - targetE, 2);
      const deltaD = Math.pow(af.danceability - targetD, 2);

      const distance = Math.sqrt(deltaV + deltaE + deltaD);
      similarityScore = Math.max(0, 1 - distance);
    }

    return { track, similarityScore };
  }).filter(Boolean);

  if (scoredTracks.length === 0 && tracks.length > 0) {
    // Soft fallback: rank all candidate tracks by distance without discarding
    const fallbackScored = tracks.map(track => {
      const af = audioMap.get(track.id);
      let similarityScore = 0.5;
      if (af) {
        const deltaV = Math.pow(af.valence - (targetFeatures.valence ?? 0.5), 2);
        const deltaE = Math.pow(af.energy - (targetFeatures.energy ?? 0.5), 2);
        const distance = Math.sqrt(deltaV + deltaE);
        similarityScore = Math.max(0, 1 - distance);
      }
      return { track, similarityScore };
    });
    fallbackScored.sort((a, b) => b.similarityScore - a.similarityScore);
    return fallbackScored.map(st => st.track);
  }

  scoredTracks.sort((a, b) => b.similarityScore - a.similarityScore);
  return scoredTracks.map(st => st.track);
}

// Fetch user's multi-timeframe library taste profile
export async function getUserLibraryTaste(token) {
  const [liked, onRepeatTracks, frequentArtists, recentlyPlayed, midTopArtists, allTimeArtists, topTracks] = await Promise.all([
    getLikedTracks(token),
    getOnRepeatTracks(token),
    getFrequentArtists(token),
    getRecentlyPlayed(token),
    getTopArtists(token, 'medium_term'),
    getTopArtists(token, 'long_term'),
    getTopTracks(token, 'medium_term'),
  ]);

  const artistMap = new Map();

  for (const a of frequentArtists) {
    if (a?.name && a?.id) {
      artistMap.set(a.id, {
        id: a.id,
        name: a.name,
        genres: a.genres || [],
        weight: 100,
        isFrequent: true,
      });
    }
  }

  for (const t of onRepeatTracks) {
    for (const a of (t.artists || [])) {
      if (a?.name && a?.id) {
        const existing = artistMap.get(a.id);
        if (existing) {
          existing.weight += 20;
        } else {
          artistMap.set(a.id, {
            id: a.id,
            name: a.name,
            genres: [],
            weight: 90,
            isOnRepeat: true,
          });
        }
      }
    }
  }

  for (const a of allTimeArtists) {
    if (a?.name && a?.id) {
      const existing = artistMap.get(a.id);
      if (existing) {
        existing.genres = a.genres || existing.genres;
        existing.weight += 15;
      } else {
        artistMap.set(a.id, {
          id: a.id,
          name: a.name,
          genres: a.genres || [],
          weight: 75,
        });
      }
    }
  }

  for (const a of midTopArtists) {
    if (a?.name && a?.id) {
      const existing = artistMap.get(a.id);
      if (existing) {
        existing.genres = a.genres || existing.genres;
        existing.weight += 10;
      } else {
        artistMap.set(a.id, {
          id: a.id,
          name: a.name,
          genres: a.genres || [],
          weight: 60,
        });
      }
    }
  }

  for (const t of liked) {
    for (const a of (t.artists || [])) {
      if (a?.name && a?.id && !artistMap.has(a.id)) {
        artistMap.set(a.id, {
          id: a.id,
          name: a.name,
          genres: [],
          weight: 40,
        });
      }
    }
  }

  const artistsList = Array.from(artistMap.values()).sort((a, b) => b.weight - a.weight);
  const allGenres = [...frequentArtists, ...allTimeArtists, ...midTopArtists].flatMap(a => a.genres || []);

  return {
    artists: artistsList,
    onRepeatTracks,
    frequentArtists,
    allTimeArtists,
    recentlyPlayedTracks: recentlyPlayed,
    topArtists: midTopArtists,
    topTracks,
    likedTracks: liked,
    genres: Array.from(new Set(allGenres)),
  };
}

// Search Spotify for specific songs recommended by AI
export async function searchSpotifyForAiTracks(token, aiSongs = [], excludedArtists = [], userPrompt = '') {
  const trackPromises = aiSongs.map(async (song) => {
    try {
      const cleanTitle = (song.title || '').replace(/\s*\([^)]*\)/g, '').trim();
      const query = `track:"${cleanTitle}" artist:"${song.artist}"`;
      const res = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query, type: 'track', limit: 1 }
      });

      let track = res.data.tracks?.items?.[0];

      if (!track) {
        const fallbackRes = await axios.get('https://api.spotify.com/v1/search', {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: `${cleanTitle} ${song.artist}`, type: 'track', limit: 1 }
        });
        track = fallbackRes.data.tracks?.items?.[0];
      }

      if (track && isHighQualityTrack(track, userPrompt, excludedArtists)) {
        return {
          ...track,
          aiReason: song.reason,
        };
      } else if (track) {
        return {
          ...track,
          aiReason: song.reason,
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(trackPromises);
  return results.filter(Boolean);
}

// Main fetchTracks function with Spotify Audio Analysis API acoustic vector validation
export async function fetchTracks(token, features, source = 'recommended', count = 10, userPrompt = '', options = {}) {
  const { discoveryLevel = 'balanced', excludedArtists = [], sessionHistory = [] } = options;

  // 1. Direct from Saved Library ("In My Library")
  if (source === 'liked' || source === 'library') {
    const liked = await getLikedTracks(token);
    if (!liked.length) return { tracks: [], aiMeta: null };

    // STRICT QUALITY & ACOUSTIC FEATURE FILTERING: Keep only tracks passing Spotify audio metrics
    const qualityLiked = liked.filter(t => isHighQualityTrack(t, userPrompt, excludedArtists));
    const candidates = qualityLiked.length > 0 ? qualityLiked : liked;
    const acousticallyMatched = await filterAndRankByAcousticVectors(token, candidates, features, userPrompt);

    if (acousticallyMatched.length === 0) {
      return { tracks: [], aiMeta: null };
    }

    return {
      tracks: acousticallyMatched.slice(0, count),
      aiMeta: null
    };
  }

  // Fetch complete multi-timeframe taste
  const taste = await getUserLibraryTaste(token);

  // 2. Try Gemini AI Recommendations with complete user listening context & strict vibe rules
  const apiKey = getGeminiApiKey();
  if (apiKey) {
    try {
      const aiResult = await getAiRecommendations({
        prompt: userPrompt,
        userTaste: taste,
        count,
        source,
        discoveryLevel,
        excludedArtists,
        sessionHistory,
      });

      if (aiResult?.songs && aiResult.songs.length > 0) {
        const spotifyTracks = await searchSpotifyForAiTracks(token, aiResult.songs, excludedArtists, userPrompt);
        const acousticallyVerified = await filterAndRankByAcousticVectors(token, spotifyTracks, features, userPrompt);
        if (acousticallyVerified.length > 0) {
          return {
            tracks: acousticallyVerified,
            aiMeta: aiResult,
          };
        }
      }
    } catch (aiErr) {
      console.warn('AI recommendation error, falling back to library engine:', aiErr);
    }
  }

  // 3. Fallback: Recommendation Engine with Spotify Audio Analysis API
  let tracksPool = [];

  if (source === 'recommended' && taste.artists.length > 0) {
    let selectedArtists = [];

    const seedGenres = (features.genres || []).map(g => g.toLowerCase());
    const compatibleArtists = taste.artists.filter(a => {
      if (!a.genres || !a.genres.length) return true;
      return a.genres.some(g => seedGenres.some(sg => g.toLowerCase().includes(sg) || sg.includes(g.toLowerCase())));
    });

    const artistsToUse = compatibleArtists.length > 0 ? compatibleArtists : taste.artists;
    const shuffledArtists = [...artistsToUse].sort(() => Math.random() - 0.5);

    if (discoveryLevel === 'comfort') {
      selectedArtists = shuffledArtists.slice(0, 6);
    } else if (discoveryLevel === 'discovery') {
      const seedArtists = shuffledArtists.slice(0, 4);
      const relatedPromises = seedArtists.map(async (a) => {
        const related = await getRelatedArtists(token, a.id);
        const topRelated = [...related].sort(() => Math.random() - 0.5).slice(0, 3);
        const relatedTracks = await Promise.all(topRelated.map(r => getArtistTopTracks(token, r.id)));
        return relatedTracks.flat();
      });
      const relatedResults = await Promise.all(relatedPromises);
      tracksPool.push(...relatedResults.flat());
      selectedArtists = shuffledArtists.slice(2, 6);
    } else {
      selectedArtists = shuffledArtists.slice(0, 6);
    }

    const ownTopTrackPromises = selectedArtists.map(a => getArtistTopTracks(token, a.id));
    const searchArtistPromises = selectedArtists.slice(0, 3).map(async (a) => {
      try {
        const randomOffset = Math.floor(Math.random() * 8);
        const res = await axios.get('https://api.spotify.com/v1/search', {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: `artist:"${a.name}"`, type: 'track', limit: 6, offset: randomOffset }
        });
        return res.data.tracks?.items || [];
      } catch {
        return [];
      }
    });

    const [ownTopResults, searchArtistResults] = await Promise.all([
      Promise.all(ownTopTrackPromises),
      Promise.all(searchArtistPromises),
    ]);

    tracksPool = [
      ...tracksPool,
      ...ownTopResults.flat(),
      ...searchArtistResults.flat(),
      ...(taste.onRepeatTracks || []).sort(() => Math.random() - 0.5).slice(0, 15),
      ...(taste.recentlyPlayedTracks || []).sort(() => Math.random() - 0.5).slice(0, 10),
      ...(taste.topTracks || []).sort(() => Math.random() - 0.5).slice(0, 10),
    ];
  } else {
    // Global Catalog Search with Targeted Mood Queries
    const randomOffset = Math.floor(Math.random() * 6);
    const shuffledSeeds = [...features.seed_artists].sort(() => Math.random() - 0.5);

    const targetQueries = [userPrompt];
    const lowerPrompt = (userPrompt || '').toLowerCase();
    if (lowerPrompt.includes('chikni') || lowerPrompt.includes('fevicol') || lowerPrompt.includes('item song') || lowerPrompt.includes('item songs')) {
      targetQueries.push('Chikni Chameli', 'Fevicol Se', 'Munni Badnaam', 'Sheila Ki Jawani', 'Badtameez Dil');
    }
    if (lowerPrompt.includes('fetty wap') || lowerPrompt.includes('rap') || lowerPrompt.includes('club rap')) {
      targetQueries.push('Fetty Wap 679', 'Trap Queen', 'Travis Scott Sicko Mode');
    }
    if (lowerPrompt.includes('house') || lowerPrompt.includes('house music')) {
      targetQueries.push('House Music Club', 'Fisher Losing It', 'David Guetta Titanium');
    }
    if (lowerPrompt.includes('adhd') || lowerPrompt.includes('brown noise') || lowerPrompt.includes('nature')) {
      targetQueries.push('Brown Noise Deep Sleep', 'Green Noise Nature', 'River Stream Soundscape');
    }

    // Add phrase chunks from prompt
    const promptWords = lowerPrompt.split(/\s+/).filter(w => w.length > 3);
    if (promptWords.length >= 2) {
      targetQueries.push(promptWords.slice(0, 2).join(' '), promptWords.slice(-2).join(' '));
    }

    const targetedSearchPromises = targetQueries.filter(Boolean).slice(0, 5).map(async (q) => {
      try {
        const res = await axios.get('https://api.spotify.com/v1/search', {
          headers: { Authorization: `Bearer ${token}` },
          params: { q, type: 'track', limit: 8, offset: Math.floor(Math.random() * 2) }
        });
        return res.data.tracks?.items || [];
      } catch { return []; }
    });

    const artistResults = await Promise.all(
      shuffledSeeds.slice(0, 4).map(async (name) => {
        try {
          const res = await axios.get('https://api.spotify.com/v1/search', {
            headers: { Authorization: `Bearer ${token}` },
            params: { q: `"${name}"`, type: 'track', limit: 8, offset: randomOffset }
          });
          return res.data.tracks?.items || [];
        } catch { return []; }
      })
    );

    const cleanGenres = (features.genres || []).filter(g => g !== 'workout' && g !== 'gym');
    const genreResults = await Promise.all(
      cleanGenres.slice(0, 2).map(async (genre) => {
        try {
          const res = await axios.get('https://api.spotify.com/v1/search', {
            headers: { Authorization: `Bearer ${token}` },
            params: { q: `${genre} music`, type: 'track', limit: 8, offset: randomOffset }
          });
          return res.data.tracks?.items || [];
        } catch { return []; }
      })
    );

    const targetedResults = await Promise.all(targetedSearchPromises);

    tracksPool = [...targetedResults.flat(), ...artistResults.flat(), ...genreResults.flat()];
  }

  const seen = new Set();
  let qualityTracks = tracksPool.filter(t => {
    if (!t || !t.id || seen.has(t.id)) return false;
    if (!isHighQualityTrack(t, userPrompt, excludedArtists)) return false;
    seen.add(t.id);
    return true;
  });

  if (qualityTracks.length === 0 && tracksPool.length > 0) {
    const fallbackSeen = new Set();
    qualityTracks = tracksPool.filter(t => {
      if (!t || !t.id || fallbackSeen.has(t.id)) return false;
      fallbackSeen.add(t.id);
      return true;
    });
  }

  // Rank candidate tracks by Spotify Audio Feature Analysis Vectors
  const rankedTracks = await filterAndRankByAcousticVectors(token, qualityTracks, features, userPrompt);

  return {
    tracks: rankedTracks.slice(0, count),
    aiMeta: null
  };
}

// Reroll / replace an individual single track
export async function rerollSingleTrack(token, moodText, existingTrackIds = [], currentTrack = null, source = 'recommended', options = {}) {
  const parsedFeatures = parseMood(moodText);
  const res = await fetchTracks(token, parsedFeatures, source, 12, moodText, options);
  const candidates = (res.tracks || []).filter(t => t && t.id && !existingTrackIds.includes(t.id));

  if (candidates.length > 0) {
    return candidates[0];
  }
  return null;
}

// Add a single track URI to the active Spotify player queue
export async function addToQueue(token, trackUri) {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(trackUri)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res;
}

// Queue all tracks sequentially — staggered to avoid rate limiting
export async function queueAllTracks(token, trackUris) {
  const validUris = trackUris.filter(u => typeof u === 'string' && u.startsWith('spotify:'));
  const results = { queued: 0, failed: 0, noDevice: false };

  for (const uri of validUris) {
    const res = await addToQueue(token, uri);
    if (res.ok || res.status === 204) {
      results.queued++;
    } else if (res.status === 404) {
      results.noDevice = true;
      break;
    } else {
      results.failed++;
    }
    await new Promise(r => setTimeout(r, 150));
  }

  return results;
}
