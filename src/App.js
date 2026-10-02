import React, { useEffect, useState } from 'react';
import { redirectToSpotifyLogin, exchangeCodeForToken, getStoredToken, clearToken } from './services/spotifyService';
import Player from './Player';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      exchangeCodeForToken(code).then(t => {
        setToken(t);
        setLoading(false);
      });
    } else {
      const stored = getStoredToken();
      if (stored) setToken(stored);
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    clearToken();
    setToken(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="pulse-loader" />
        <p>Connecting to Spotify...</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      {!token ? (
        <div className="login-wrapper">
          <div className="login-card glass-panel">
            <div className="login-badge">AI-POWERED MUSIC & QUEUE</div>
            <h1 className="login-title">🎵 MoodQueue</h1>
            <p className="login-subtitle">
              Describe your exact feeling or vibe in natural language, and let AI discover tailored music and queue it directly to your active Spotify session.
            </p>
            
            <div className="login-features">
              <div className="feature-item">⚡ Natural Language Mood Engine</div>
              <div className="feature-item">🎧 Personalized Library & Artist Matching</div>
              <div className="feature-item">▶ Instant Auto-Queue to Spotify Player</div>
            </div>

            <button className="login-btn glow-effect" onClick={redirectToSpotifyLogin}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.48-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/>
              </svg>
              Connect with Spotify
            </button>

            <span className="auth-note">Uses official Spotify OAuth 2.0 PKCE authentication.</span>
          </div>
        </div>
      ) : (
        <Player token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;