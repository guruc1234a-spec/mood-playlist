const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI;

const scopes = [
  'user-library-read',
  'playlist-modify-public',
  'playlist-modify-private',
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
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem('pkce_verifier');

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  localStorage.setItem('spotify_token', data.access_token);
  localStorage.removeItem('pkce_verifier');
  return data.access_token;
}

export function getStoredToken() {
  return localStorage.getItem('spotify_token');
}

export function clearToken() {
  localStorage.removeItem('spotify_token');
}