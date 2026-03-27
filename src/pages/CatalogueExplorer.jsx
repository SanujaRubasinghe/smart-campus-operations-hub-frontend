import React, { useState, useEffect } from 'react';
import SmartSearchBar from '../components/catalog/SmartSearchBar';
import ResourceCard from '../components/catalog/ResourceCard';
import { fetchCatalogue, fetchRecommendations } from '../services/api';
import '../assets/css/catalog.css';

const CatalogueExplorer = () => {
  const [resources, setResources] = useState([]);
  const [isAiMode, setIsAiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the default catalogue when the component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Ensure you return list in data or handle Spring Data JPA's Response entity properly
        // If your Spring Boot returns an array, .data will be that array.
        // If it returns a paginated object, it might be .data.content
        const data = await fetchCatalogue();
        
        // Handle both raw arrays and Page<T> formats
        const resourceList = Array.isArray(data) ? data : data.content || [];
        setResources(resourceList);
      } catch (err) {
        setError('Unable to connect to the server. Please ensure the backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Async function to handle the Smart Search intent
  const handleSearch = async (query) => {
    if (!query.trim()) {
      // If empty query, reset to regular catalogue
      setIsAiMode(false);
      setIsLoading(true);
      try {
        const data = await fetchCatalogue();
        const resourceList = Array.isArray(data) ? data : data.content || [];
        setResources(resourceList);
      } catch (err) {
        setError('Unable to fetch catalogue data.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsAiMode(true);
      const recommendedData = await fetchRecommendations(query);
      // AI endpoint usually returns a smaller targeted array
      setResources(Array.isArray(recommendedData) ? recommendedData : []);
    } catch (err) {
      setError('Failed to fetch recommendations from the AI engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="catalog-container">
      <SmartSearchBar onSearch={handleSearch} />
      
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#86868b' }}>
          <h3>Analyzing campus facilities...</h3>
          <p>Please wait while we connect to the Smart Campus operations hub.</p>
        </div>
      )}

      {!isLoading && error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem' }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      {!isLoading && !error && resources.length === 0 && (
        <div className="empty-state">
          No facilities match your request. Try adjusting your search query.
        </div>
      )}

      {!isLoading && !error && resources.length > 0 && (
        <div className="resource-grid">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogueExplorer;
