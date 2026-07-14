import React, { useEffect, useState } from 'react';
import { redirectToSpotifyLogin, exchangeCodeForToken, getStoredToken, clearToken } from './spotify';
import Player from './Player';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      window.history.replaceState({}, document.title, '/');
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

  if (loading) return <div className="app"><p>Loading...</p></div>;

  return (
    <div className="app">
      {!token ? (
        <div className="login-screen">
          <h1>🎵 Mood Playlist</h1>
          <p>Describe how you're feeling and get a playlist that matches.</p>
          <button className="login-btn" onClick={redirectToSpotifyLogin}>
            Connect Spotify
          </button>
        </div>
      ) : (
        <>
          <Player token={token} />
          <button className="logout-btn" onClick={handleLogout}>Disconnect</button>
        </>
      )}
    </div>
  );
}

export default App;