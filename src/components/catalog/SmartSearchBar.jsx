import React, { useState } from 'react';
import '../../assets/css/catalog.css';

const SmartSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('NORMAL'); // 'NORMAL' or 'AI'

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query, mode);
  };

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
    // Note: We don't automatically trigger a search on mode flip to let the user review
  };

  const placeholderText = mode === 'AI' 
    ? "Describe your need, e.g., 'A quiet room with a projector'" 
    : "Search facility by exact name (e.g., 'Auditorium')...";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div className="search-mode-toggle">
        <button 
          className={`mode-btn ${mode === 'NORMAL' ? 'active' : ''}`}
          onClick={() => handleModeChange('NORMAL')}
        >
          Standard Search
        </button>
        <button 
          className={`mode-btn ${mode === 'AI' ? 'active' : ''}`}
          onClick={() => handleModeChange('AI')}
        >
          AI Assistant ✨
        </button>
      </div>

      <div className="smart-search-wrapper" style={{ width: '100%', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="smart-search-input"
            placeholder={placeholderText}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', flexShrink: 0 }}>
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default SmartSearchBar;
