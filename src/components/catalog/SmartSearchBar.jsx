import React, { useState } from 'react';

const SmartSearchBar = ({ onSearch }) => {
  const [intent, setIntent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (intent.trim()) onSearch(intent);
  };

  return (
    <div className="smart-search-wrapper">
      <h2 style={{ marginBottom: '0.5rem', background: '-webkit-linear-gradient(#007bff, #00d2ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        AI Campus Finder
      </h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>Describe your ideal workspace in plain English.</p>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="smart-search-input"
          placeholder="e.g., I need a lab for 40 students with high-end GPUs..."
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
        />
        <button type="submit" className="smart-search-btn">Discover</button>
      </form>
    </div>
  );
};

export default SmartSearchBar;
