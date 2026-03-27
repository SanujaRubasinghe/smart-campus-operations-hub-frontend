import React, { useState, useEffect } from 'react';
import SmartSearchBar from '../components/catalog/SmartSearchBar';
import ResourceCard from '../components/catalog/ResourceCard';
import FilterBar from '../components/catalog/FilterBar';
import Pagination from '../components/catalog/Pagination';
import { fetchCatalogue, fetchRecommendations } from '../services/api';
import '../assets/css/catalog.css';

const CatalogueExplorer = () => {
  const [resources, setResources] = useState([]);
  const [isAiMode, setIsAiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and Filters State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ type: '', minCapacity: '', name: '' });
  const pageSize = 20;

  useEffect(() => {
    // Standard filtered/paginated fetch
    if (!isAiMode) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await fetchCatalogue(currentPage, pageSize, filters.type, filters.minCapacity, filters.name);
          if (Array.isArray(data)) {
             setResources(data);
             setTotalPages(1);
          } else {
             setResources(data.content || []);
             setTotalPages(data.totalPages || 1);
          }
        } catch (err) {
          setError('Unable to fetch the catalogue. Is your backend running?');
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [currentPage, filters, isAiMode]);

  const handleSearch = async (query, mode) => {
    if (mode === 'NORMAL') {
      setIsAiMode(false);
      setFilters(prev => ({ ...prev, name: query }));
      setCurrentPage(0); // Reset page on new search
      return;
    }

    if (mode === 'AI') {
      if (!query.trim()) {
        setIsAiMode(false);
        setFilters(prev => ({ ...prev, name: '' }));
        setCurrentPage(0);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setIsAiMode(true);
        const data = await fetchRecommendations(query);
        setResources(Array.isArray(data) ? data : []);
        setTotalPages(1); // AI mode doesn't paginate
      } catch (err) {
        setError('Failed to fetch AI recommendations from backend.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    // newFilters won't have the 'name' property from FilterBar since it's not rendered there,
    // so we need to spread the existing name back in.
    setFilters(prev => ({ ...newFilters, name: prev.name }));
    setCurrentPage(0); 
    setIsAiMode(false); 
  };

  return (
    <div className="catalog-container">
      <SmartSearchBar onSearch={handleSearch} />
      
      {!isAiMode && (
        <FilterBar 
          filters={filters} 
          onFilterChange={(newFilters) => handleFilterChange(newFilters)} 
        />
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#86868b' }}>
          <h3>Loading facilities...</h3>
          <p>Connecting to the Smart Campus database.</p>
        </div>
      )}

      {!isLoading && error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem' }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      {!isLoading && !error && resources.length === 0 && (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: '#86868b', fontSize: '1.1rem' }}>
          No facilities match your request. Adjust your filters or search query.
        </div>
      )}

      {!isLoading && !error && resources.length > 0 && (
        <>
          <div className="resource-grid">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          
          {!isAiMode && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CatalogueExplorer;
