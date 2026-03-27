import React from 'react';

const ResourceCard = ({ resource }) => {
  const isActive = resource.status === 'ACTIVE';

  return (
    <div className="resource-card">
      <span className={`status-badge ${isActive ? 'status-active' : 'status-out'}`}>
        {resource.status.replace('_', ' ')}
      </span>
      
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>{resource.name}</h3>
      <p style={{ margin: '0 0 1rem 0', color: '#666', fontWeight: '500' }}>
        {resource.type.replace('_', ' ')} • {resource.capacity} Seats
      </p>
      
      <div className="amenities-tags">
        {resource.amenities?.map((item, idx) => (
          <span key={idx} className="tag">{item}</span>
        ))}
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: '#888' }}>📍 {resource.location}</span>
        {/* Member 2 will likely wire this button up to their booking flow later! */}
        <button style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #007bff', color: '#007bff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
          Book Space
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
