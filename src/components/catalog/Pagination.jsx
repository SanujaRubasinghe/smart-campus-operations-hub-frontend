import React from 'react';
import '../../assets/css/catalog.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button 
        className="btn-secondary" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        style={{ opacity: currentPage === 0 ? 0.5 : 1 }}
      >
        Previous
      </button>

      <span className="page-info">
        Page {currentPage + 1} of {totalPages}
      </span>

      <button 
        className="btn-secondary" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        style={{ opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
