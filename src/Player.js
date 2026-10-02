import React, { useState, useEffect } from 'react';
import { parseMood } from './utils/moodParser';
import { fetchTracks, queueAllTracks, getCurrentUser, rerollSingleTrack } from './services/spotifyService';
import { getGeminiApiKey } from './services/aiService';
import MoodPills from './components/MoodPills';
import MoodStats from './components/MoodStats';
import TrackCard from './components/TrackCard';
import ApiKeyModal from './components/ApiKeyModal';

function Player({ token, onLogout }) {
  const [moodText, setMoodText] = useState('');
  const [parsedMood, setParsedMood] = useState(null);
  const [aiMeta, setAiMeta] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [source, setSource] = useState('recommended');
  const [trackCount, setTrackCount] = useState(10);
  const [discoveryLevel, setDiscoveryLevel] = useState('balanced');
  const [excludedArtists, setExcludedArtists] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [user, setUser] = useState(null);
  const [hasAiKey, setHasAiKey] = useState(!!getGeminiApiKey());
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Queue state
  const [queueing, setQueueing] = useState(false);
  const [queueMsg, setQueueMsg] = useState('');

  useEffect(() => {
    if (token) getCurrentUser(token).then(u => { if (u) setUser(u); });
    setHasAiKey(!!getGeminiApiKey());
  }, [token]);

  const handleGenerate = async (
    customMood = null,
    customSource = null,
    customCount = null,
    customDiscovery = null,
    customExcluded = null,
    isShuffle = false
  ) => {
    const textToUse = customMood !== null ? customMood : moodText;
    const sourceToUse = customSource !== null ? customSource : source;
    const countToUse = customCount !== null ? customCount : trackCount;
    const discoveryToUse = customDiscovery !== null ? customDiscovery : discoveryLevel;
    const excludedToUse = customExcluded !== null ? customExcluded : excludedArtists;

    if (!textToUse.trim()) return;
    if (customMood !== null) setMoodText(customMood);

    setLoading(true);
    setError('');
    setQueueMsg('');
    setAiMeta(null);

    try {
      const features = parseMood(textToUse);
      setParsedMood(features);

      const res = await fetchTracks(
        token,
        features,
        sourceToUse,
        countToUse,
        textToUse,
        {
          discoveryLevel: discoveryToUse,
          excludedArtists: excludedToUse,
          sessionHistory: isShuffle ? sessionHistory : [],
        }
      );

      const results = res.tracks || [];
      setTracks(results);

      // Record titles in session history to prevent future repetition
      const newTitles = results.map(t => `${t.name} by ${t.artists?.[0]?.name}`).filter(Boolean);
      setSessionHistory(prev => Array.from(new Set([...prev, ...newTitles])).slice(-50));

      if (res.aiMeta) {
        setAiMeta(res.aiMeta);
      }

      if (results.length === 0) {
        setError('No tracks found for this mood in this mode. Try another source or describe your vibe differently.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Error fetching tracks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSourceChange = (newSource) => {
    if (newSource === source) return;
    setSource(newSource);
    if (moodText.trim()) {
      handleGenerate(moodText, newSource, trackCount, discoveryLevel, excludedArtists);
    }
  };

  const handleCountChange = (newCount) => {
    const countNum = Number(newCount);
    setTrackCount(countNum);
    if (moodText.trim()) {
      handleGenerate(moodText, source, countNum, discoveryLevel, excludedArtists);
    }
  };

  const handleDiscoveryChange = (newDiscovery) => {
    setDiscoveryLevel(newDiscovery);
    if (moodText.trim()) {
      handleGenerate(moodText, source, trackCount, newDiscovery, excludedArtists);
    }
  };

  const handleShuffle = () => {
    if (moodText.trim()) {
      handleGenerate(moodText, source, trackCount, discoveryLevel, excludedArtists, true);
    }
  };

  const handleRerollTrack = async (trackToReplace, index) => {
    try {
      const existingIds = tracks.map(t => t.id).filter(Boolean);
      const replacement = await rerollSingleTrack(
        token,
        moodText,
        existingIds,
        trackToReplace,
        source,
        { discoveryLevel, excludedArtists, sessionHistory }
      );

      if (replacement) {
        const updated = [...tracks];
        updated[index] = replacement;
        setTracks(updated);
        setSessionHistory(prev => [...prev, `${replacement.name} by ${replacement.artists?.[0]?.name}`]);
      }
    } catch (err) {
      console.warn('Could not reroll track:', err);
    }
  };

  const handleExcludeArtist = (artistName) => {
    if (!artistName || excludedArtists.includes(artistName)) return;
    const updated = [...excludedArtists, artistName];
    setExcludedArtists(updated);

    const filteredTracks = tracks.filter(t => !t.artists?.some(a => a.name.toLowerCase() === artistName.toLowerCase()));
    setTracks(filteredTracks);

    if (moodText.trim()) {
      handleGenerate(moodText, source, trackCount, discoveryLevel, updated);
    }
  };

  const handleRemoveExcludedArtist = (artistName) => {
    const updated = excludedArtists.filter(a => a !== artistName);
    setExcludedArtists(updated);
    if (moodText.trim()) {
      handleGenerate(moodText, source, trackCount, discoveryLevel, updated);
    }
  };

  const handlePlayAll = async () => {
    if (!tracks.length) return;

    const firstTrack = tracks[0];
    if (firstTrack?.external_urls?.spotify) {
      window.open(firstTrack.external_urls.spotify, '_blank');
    }

    if (tracks.length <= 1) return;

    setQueueing(true);
    setQueueMsg('⏳ Waiting for Spotify to start... then queueing tracks...');

    await new Promise(r => setTimeout(r, 3000));

    const urisToQueue = tracks.slice(1).map(t => t.uri).filter(Boolean);
    const results = await queueAllTracks(token, urisToQueue);

    if (results.noDevice) {
      setQueueMsg('⚠️ No active Spotify device found. Open Spotify and start playing, then click "Queue Rest" below.');
    } else if (results.queued > 0) {
      setQueueMsg(`✅ ${results.queued} tracks queued in Spotify! Check your queue in the Spotify app.`);
    } else {
      setQueueMsg('⚠️ Tracks could not be queued. Make sure Spotify is open and playing.');
    }

    setQueueing(false);
  };

  const handleQueueRest = async () => {
    if (!tracks.length) return;
    setQueueing(true);
    setQueueMsg('⏳ Queueing remaining tracks...');

    const urisToQueue = tracks.slice(1).map(t => t.uri).filter(Boolean);
    const results = await queueAllTracks(token, urisToQueue);

    if (results.noDevice) {
      setQueueMsg('⚠️ No active Spotify device. Open Spotify and play something first, then try again.');
    } else if (results.queued > 0) {
      setQueueMsg(`✅ ${results.queued} tracks queued! Open Spotify to see your queue.`);
    } else {
      setQueueMsg('⚠️ Could not queue tracks. Make sure Spotify is open and playing.');
    }
    setQueueing(false);
  };

  const themeStyle = parsedMood ? { background: parsedMood.themeGradient } : {};

  return (
    <div className="player-wrapper" style={themeStyle}>
      <header className="player-header">
        <div className="header-brand">
          <span className="brand-logo">🎵</span>
          <span className="brand-title">MoodQueue</span>
        </div>

        <div className="header-actions">
          <button
            className={`ai-key-badge-btn ${hasAiKey ? 'active' : ''}`}
            onClick={() => setShowKeyModal(true)}
            title="Configure your free Google Gemini AI Key"
          >
            {hasAiKey ? '✨ Gemini AI Active' : '⚡ Add Free AI Key'}
          </button>

          {user && (
            <div className="user-profile">
              {user.images?.[0]?.url ? (
                <img src={user.images[0].url} alt={user.display_name} className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">{user.display_name?.[0] || 'U'}</div>
              )}
              <span className="user-name">{user.display_name}</span>
              <button className="logout-btn-header" onClick={onLogout}>Disconnect</button>
            </div>
          )}
        </div>
      </header>

      <div className="player-container">
        <section className="input-card">
          <div className="config-row">
            <div className="source-toggle">
              <button
                type="button"
                className={source === 'recommended' ? 'active' : ''}
                onClick={() => handleSourceChange('recommended')}
                title="Personalized recommendations tailored to your on-repeat songs and library"
              >
                ✨ Recommended For Me
              </button>
              <button
                type="button"
                className={source === 'liked' ? 'active' : ''}
                onClick={() => handleSourceChange('liked')}
                title="Only match songs already saved in your Liked Songs"
              >
                💚 In My Library
              </button>
              <button
                type="button"
                className={source === 'catalog' ? 'active' : ''}
                onClick={() => handleSourceChange('catalog')}
                title="Discover new songs across Spotify's entire catalog"
              >
                🌐 Global Catalog
              </button>
            </div>

            <div className="count-selector">
              <label>Tracks:</label>
              <select value={trackCount} onChange={e => handleCountChange(e.target.value)} disabled={loading}>
                <option value={5}>5 Tracks</option>
                <option value={10}>10 Tracks</option>
                <option value={20}>20 Tracks</option>
                <option value={30}>30 Tracks</option>
              </select>
            </div>
          </div>

          {source === 'recommended' && (
            <div className="discovery-row">
              <span className="discovery-label">Discovery Blend:</span>
              <div className="discovery-pills">
                <button
                  type="button"
                  className={`discovery-pill ${discoveryLevel === 'comfort' ? 'active' : ''}`}
                  onClick={() => handleDiscoveryChange('comfort')}
                  title="Heavy on your favorite on-repeat artists"
                >
                  🔥 Favorites First
                </button>
                <button
                  type="button"
                  className={`discovery-pill ${discoveryLevel === 'balanced' ? 'active' : ''}`}
                  onClick={() => handleDiscoveryChange('balanced')}
                  title="50/50 balance of favorites and taste-matched new artists"
                >
                  ⚖️ Balanced Mix
                </button>
                <button
                  type="button"
                  className={`discovery-pill ${discoveryLevel === 'discovery' ? 'active' : ''}`}
                  onClick={() => handleDiscoveryChange('discovery')}
                  title="Deep underground and fresh artists in your sonic universe"
                >
                  🧭 Deep Discovery
                </button>
              </div>
            </div>
          )}

          {excludedArtists.length > 0 && (
            <div className="excluded-artists-bar">
              <span className="excluded-label">Excluded Artists:</span>
              <div className="excluded-chips">
                {excludedArtists.map(artist => (
                  <span key={artist} className="excluded-chip">
                    {artist}
                    <button
                      type="button"
                      className="remove-chip-btn"
                      onClick={() => handleRemoveExcludedArtist(artist)}
                      title={`Allow recommendations from ${artist} again`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <MoodPills onSelectMood={(txt) => handleGenerate(txt)} disabled={loading} />

          <div className="mood-textarea-wrapper">
            <textarea
              value={moodText}
              onChange={e => setMoodText(e.target.value)}
              placeholder="Describe your vibe... e.g. 'late night driving through neon streets, nostalgic & chill'"
              rows={3}
              disabled={loading}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            />
            <div className="generate-actions-row">
              <button
                className="generate-btn"
                onClick={() => handleGenerate()}
                disabled={loading || !moodText.trim()}
                style={{ backgroundColor: parsedMood?.accentColor || '#1db954' }}
              >
                {loading ? '🧠 Finding & matching tracks...' : '✨ Find & Match Tracks'}
              </button>

              {tracks.length > 0 && (
                <button
                  type="button"
                  className="shuffle-btn"
                  onClick={handleShuffle}
                  disabled={loading || !moodText.trim()}
                  title="Generate a completely fresh mix of different songs for this mood"
                >
                  🔀 Fresh Mix
                </button>
              )}
            </div>
          </div>
        </section>

        {aiMeta && (
          <div className="ai-vibe-banner">
            <div className="ai-vibe-header">
              <span className="ai-vibe-sparkle">✨</span>
              <h3 className="ai-vibe-title">{aiMeta.vibeTitle || 'AI Vibe Match'}</h3>
            </div>
            {aiMeta.vibeDescription && (
              <p className="ai-vibe-desc">{aiMeta.vibeDescription}</p>
            )}
          </div>
        )}

        {parsedMood && !loading && tracks.length > 0 && <MoodStats mood={parsedMood} />}

        {error && <div className="toast toast-error">{error}</div>}

        {loading && (
          <div className="tracks-skeleton-list">
            {[1, 2, 3, 4, 5].map(n => <div key={n} className="track-skeleton" />)}
          </div>
        )}

        {!loading && tracks.length > 0 && (
          <section className="results-section">
            <div className="results-header">
              <h2>
                {source === 'recommended' && '✨ Recommended for You'}
                {source === 'liked' && '💚 From Your Library'}
                {source === 'catalog' && '🌐 Global Match'} ({tracks.length} Tracks)
              </h2>
              <div className="results-actions">
                <button
                  className="play-all-btn"
                  onClick={handlePlayAll}
                  disabled={queueing}
                  title="Opens first track in Spotify, then queues the rest automatically"
                >
                  {queueing ? '⏳ Queueing...' : '▶ Play All in Spotify'}
                </button>
                <button
                  className="queue-rest-btn"
                  onClick={handleQueueRest}
                  disabled={queueing}
                  title="Queue all remaining tracks (use after Spotify is already playing)"
                >
                  {queueing ? '⏳' : '+ Queue Rest'}
                </button>
              </div>
            </div>

            {queueMsg && (
              <div className={`toast ${queueMsg.startsWith('✅') ? 'toast-success' : 'toast-error'}`}>
                {queueMsg}
              </div>
            )}

            <div className="play-hint">
              💡 Click <strong>▶ Play All</strong> to open the first song in Spotify and auto-queue the rest.
              Use <strong>🔄</strong> to reroll any song or <strong>🚫</strong> to exclude an artist.
            </div>

            <div className="tracks-list">
              {tracks.map((track, idx) => (
                <TrackCard
                  key={track.id || idx}
                  track={track}
                  index={idx}
                  onReroll={handleRerollTrack}
                  onExcludeArtist={handleExcludeArtist}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onKeySaved={(k) => {
          setHasAiKey(!!k);
          if (moodText.trim()) handleGenerate(moodText);
        }}
      />
    </div>
  );
}

export default Player;