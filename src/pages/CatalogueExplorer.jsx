import React, { useState } from 'react';
import SmartSearchBar from '../components/catalog/SmartSearchBar';
import ResourceCard from '../components/catalog/ResourceCard';
import '../assets/css/catalog.css';

const CatalogueExplorer = () => {
  const [resources, setResources] = useState([
    /* Placeholder data to demonstrate UI before API integration */
    {
      id: "R-001",
      name: "Main Auditorium",
      type: "Auditorium",
      capacity: 500,
      location: "Block A - Level 1",
      status: "ACTIVE",
      amenities: ["Projector", "Sound System", "Stage"]
    },
    {
      id: "R-002",
      name: "Discussion Room B",
      type: "Meeting Room",
      capacity: 8,
      location: "Block C - Level 3",
      status: "OUT_OF_SERVICE",
      amenities: ["Whiteboard", "TV"]
    }
  ]);
  const [isAiMode, setIsAiMode] = useState(false);

  const handleSearch = (query) => {
    console.log("Searching for:", query);
    // In Phase 6, this will trigger the precise Axios logic using AI capabilities
    if (query.length > 0) {
      setIsAiMode(true);
    } else {
      setIsAiMode(false);
    }
  };

  return (
    <div className="catalog-container">
      <SmartSearchBar onSearch={handleSearch} />
      
      <div className="resource-grid">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <div className="empty-state">
            No resources found. Try adjusting your search query.
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogueExplorer;
