import React from 'react';
import { PRESET_MOODS } from '../utils/moodParser';

function MoodPills({ onSelectMood, disabled }) {
  return (
    <div className="mood-pills">
      <span className="pills-label">Quick Vibes:</span>
      <div className="pills-container">
        {PRESET_MOODS.map((preset, index) => (
          <button
            key={index}
            className="pill-btn"
            disabled={disabled}
            onClick={() => onSelectMood(preset.text)}
            type="button"
          >
            <span>{preset.icon}</span> {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodPills;
