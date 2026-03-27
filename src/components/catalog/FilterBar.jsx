import React from 'react';
import '../../assets/css/catalog.css';

const FilterBar = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="filter-bar">
      <select 
        name="type" 
        value={filters.type} 
        onChange={handleChange}
        className="filter-select"
      >
        <option value="">All Types</option>
        <option value="LAB">Lab</option>
        <option value="LECTURE_HALL">Lecture Hall</option>
        <option value="MEETING_ROOM">Meeting Room</option>
        <option value="EQUIPMENT">Equipment</option>
      </select>

      <input
        type="number"
        name="minCapacity"
        placeholder="Min Capacity"
        value={filters.minCapacity}
        onChange={handleChange}
        className="filter-input"
        min="0"
      />
    </div>
  );
};

export default FilterBar;
