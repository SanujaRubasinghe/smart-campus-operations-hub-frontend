import React from 'react';
import '../../assets/css/catalog.css';

const ResourceCard = ({ resource }) => {
  // Map internal status to badge class
  const badgeClass = resource.status === 'ACTIVE' ? 'badge-active' : 'badge-out_of_service';

  return (
    <div className="resource-card">
      <div className="resource-header">
        <div>
          <h3 className="resource-title">{resource.name}</h3>
          <p className="resource-type">{resource.type}</p>
        </div>
        <span className={`badge ${badgeClass}`}>
          {resource.status}
        </span>
      </div>

      <div className="resource-details">
        <div className="detail-item">
          <strong>Capacity:</strong> {resource.capacity} people
        </div>
        <div className="detail-item">
          <strong>Location:</strong> {resource.location}
        </div>
      </div>

      {resource.amenities && resource.amenities.length > 0 && (
        <div className="amenities-list">
          {resource.amenities.map((amenity, index) => (
            <span key={index} className="amenity-tag">
              {amenity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
