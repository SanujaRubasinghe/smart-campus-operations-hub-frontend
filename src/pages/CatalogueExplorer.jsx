import React, { useState } from 'react';
import SmartSearchBar from '../components/catalog/SmartSearchBar';
import ResourceCard from '../components/catalog/ResourceCard';
import '../assets/css/catalog.css';

const CatalogueExplorer = () => {
  // Placeholder state until we connect the Axios API in Phase 6
  const [resources, setResources] = useState([
    {
      id: 1,
      status: 'ACTIVE',
      name: 'High-Performance Lab A',
      type: 'Computer Lab',
      capacity: 40,
      amenities: ['High-end GPUs', 'Dual Monitors', 'Whiteboard'],
      location: 'Building C, Floor 2'
    },
    {
      id: 2,
      status: 'UNDER_MAINTENANCE',
      name: 'Study Room 101',
      type: 'Study Space',
      capacity: 6,
      amenities: ['Smart TV', 'Power Outlets'],
      location: 'Library, Ground Floor'
    }
  ]);
  const [isAiMode, setIsAiMode] = useState(false);

  const handleSmartSearch = (intent) => {
    console.log("AI NLP Intent captured:", intent);
    setIsAiMode(true);
    // API Call will go here in Phase 6
  };

  return (
    <div className="catalog-container">
      <SmartSearchBar onSearch={handleSmartSearch} />
      
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #eaeaea', paddingBottom: '0.5rem' }}>
          {isAiMode ? "Top Recommended Spaces" : "Campus Facilities Directory"}
        </h2>
        
        <div className="resource-grid">
          {resources.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Awaiting API connection to load resources...</p>
          ) : (
            resources.map((res) => <ResourceCard key={res.id} resource={res} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogueExplorer;
