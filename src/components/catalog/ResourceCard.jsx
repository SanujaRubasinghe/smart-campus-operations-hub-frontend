import React from 'react';

const ResourceCard = ({ resource }) => {
  const getBadgeClass = (status) => {
    return status === 'ACTIVE' ? 'badge-active' : 'badge-out_of_service';
  };

  // Provide a clean, aesthetic fallback image so the UI looks incredible even if no image was uploaded
  const fallbackImgUrl = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800";
  
  // Conditionally construct the image URL pointing strictly to 8081 if imageUrl is provided
  const imageUrl = resource.imageUrl ? `http://localhost:8081${resource.imageUrl}` : fallbackImgUrl;

  return (
    <div className="resource-card">
      
      <div className="resource-image-container">
        <img 
          src={imageUrl} 
          alt={resource.name}
          className="resource-image"
          onError={(e) => { e.target.src = fallbackImgUrl }} // Safety fallback if local image URL 404s
        />
      </div>

      <div className="resource-content">
        <div className="resource-header">
          <div>
            <h3 className="resource-title">{resource.name}</h3>
            <p className="resource-type">{resource.type}</p>
          </div>
          <span className={`badge ${getBadgeClass(resource.status)}`}>
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

        <div className="amenities-list">
          {resource.amenities && resource.amenities.map((amenity, index) => (
            <span key={index} className="amenity-tag">{amenity}</span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ResourceCard;
