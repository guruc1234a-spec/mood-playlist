import React from 'react';

function MoodStats({ mood }) {
  if (!mood) return null;

  const energyPct = Math.round(mood.energy * 100);
  const moodPct = Math.round(mood.valence * 100);
  const dancePct = Math.round(mood.danceability * 100);

  return (
    <div className="mood-stats-bar">
      <div className="stat-badge">
        <span className="stat-icon">⚡</span>
        <span className="stat-name">Energy</span>
        <span className="stat-value">{energyPct}%</span>
      </div>
      <div className="stat-badge">
        <span className="stat-icon">😊</span>
        <span className="stat-name">Valence</span>
        <span className="stat-value">{moodPct}%</span>
      </div>
      <div className="stat-badge">
        <span className="stat-icon">💃</span>
        <span className="stat-name">Danceability</span>
        <span className="stat-value">{dancePct}%</span>
      </div>
      <div className="stat-badge genre-badge">
        <span className="stat-icon">🎵</span>
        <span className="stat-name">Vibe</span>
        <span className="stat-value">{mood.genres[0] || 'Indie'}</span>
      </div>
    </div>
  );
}

export default MoodStats;
