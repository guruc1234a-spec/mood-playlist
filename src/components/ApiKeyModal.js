import React, { useState, useEffect } from 'react';
import { getGeminiApiKey, setGeminiApiKey } from '../services/aiService';

function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [keyInput, setKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getGeminiApiKey());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(keyInput);
    setSavedSuccess(true);
    if (onKeySaved) onKeySaved(keyInput.trim());
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setGeminiApiKey('');
    setKeyInput('');
    if (onKeySaved) onKeySaved('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">🤖</span>
            <h3>Gemini AI Key Settings</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <p className="modal-description">
          Add your <strong>free Google Gemini API Key</strong> for intelligent, hyper-accurate recommendations matching your exact music taste and mood with zero hardcoding.
        </p>

        <div className="key-input-container">
          <label className="input-label">Google Gemini API Key:</label>
          <input
            type="password"
            className="key-input"
            placeholder="AIzaSy..."
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
          />
        </div>

        <div className="free-key-guide">
          <span>💡 <strong>Need a free key?</strong> Get one in 10 seconds (100% free, no credit card):</span>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="get-key-link"
          >
            Get Free Gemini API Key ↗
          </a>
        </div>

        {savedSuccess && (
          <div className="modal-saved-toast">
            ✅ API Key saved! AI recommendations are active.
          </div>
        )}

        <div className="modal-actions">
          {keyInput && (
            <button className="clear-key-btn" onClick={handleClear} type="button">
              Remove Key
            </button>
          )}
          <button className="cancel-btn" onClick={onClose} type="button">
            Close
          </button>
          <button className="save-key-btn" onClick={handleSave} type="button">
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyModal;
