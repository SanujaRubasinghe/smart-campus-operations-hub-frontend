import React, { useState } from 'react';
import '../../assets/css/catalog.css';

const SmartSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="smart-search-wrapper" onSubmit={handleSubmit}>
      <input
        type="text"
        className="smart-search-input"
        placeholder="Search for facilities, e.g., 'A quiet room with a projector'"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
};

export default SmartSearchBar;
