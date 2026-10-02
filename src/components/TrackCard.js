import React, { useState } from 'react';

function TrackCard({ track, index, onReroll, onExcludeArtist }) {
  const [showEmbed, setShowEmbed] = useState(false);
  const [rerolling, setRerolling] = useState(false);

  const albumArt = track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || 'https://via.placeholder.com/64?text=🎵';
  const trackName = track.name || 'Unknown Track';
  const artistNames = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';
  const primaryArtist = track.artists?.[0]?.name;
  const spotifyUrl = track.external_urls?.spotify;

  const handleRerollClick = async () => {
    if (!onReroll || rerolling) return;
    setRerolling(true);
    await onReroll(track, index);
    setRerolling(false);
  };

  return (
    <div className={`track-card ${rerolling ? 'card-rerolling' : ''}`}>
      <div className="track-number">{index + 1}</div>
      <img className="track-cover" src={albumArt} alt={track.album?.name || trackName} />
      
      <div className="track-details">
        <div className="track-title-row">
          <span className="track-title" title={trackName}>{trackName}</span>
          {track.explicit && <span className="explicit-tag">E</span>}
        </div>
        <p className="track-artist" title={artistNames}>{artistNames}</p>
        <span className="album-name">{track.album?.name}</span>
        {track.aiReason && (
          <div className="ai-reason-pill">
            <span className="ai-sparkle">✨</span> {track.aiReason}
          </div>
        )}
      </div>

      <div className="track-actions">
        {onReroll && (
          <button
            type="button"
            className="action-icon-btn reroll-btn"
            onClick={handleRerollClick}
            disabled={rerolling}
            title="Swap this song for another recommendation"
          >
            {rerolling ? '⏳' : '🔄'}
          </button>
        )}

        {onExcludeArtist && primaryArtist && (
          <button
            type="button"
            className="action-icon-btn exclude-btn"
            onClick={() => onExcludeArtist(primaryArtist)}
            title={`Don't recommend ${primaryArtist} in this session`}
          >
            🚫
          </button>
        )}

        {track.preview_url ? (
          <audio controls src={track.preview_url} className="audio-player" />
        ) : (
          <button 
            type="button" 
            className="toggle-embed-btn" 
            onClick={() => setShowEmbed(!showEmbed)}
            title="Toggle Spotify mini player"
          >
            {showEmbed ? 'Hide Player' : 'Preview'}
          </button>
        )}

        {spotifyUrl && (
          <a
            className="spotify-link"
            href={spotifyUrl}
            target="_blank"
            rel="noreferrer"
            title="Open in Spotify App"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.48-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/>
            </svg>
          </a>
        )}
      </div>

      {showEmbed && spotifyUrl && (
        <div className="embed-container">
          <iframe
            src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={`Spotify Player for ${trackName}`}
          />
        </div>
      )}
    </div>
  );
}

export default TrackCard;
