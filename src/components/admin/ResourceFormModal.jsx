import React, { useState, useEffect } from 'react';
import '../../assets/css/catalog.css';

const ResourceFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'LAB',
    capacity: 0,
    location: '',
    status: 'ACTIVE',
    amenities: []
  });
  const [amenityInput, setAmenityInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '', type: 'LAB', capacity: 0, location: '', status: 'ACTIVE', amenities: []
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddAmenity = (e) => {
    e.preventDefault();
    if (amenityInput.trim()) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (indexToRemove) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{marginTop: 0, marginBottom: '2rem', letterSpacing: '-0.02em'}}>
          {initialData ? 'Edit Facility' : 'Add New Facility'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="LAB">Lab</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label>Capacity</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="0" />
            </div>
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 2}}>
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Amenities</label>
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
              <input 
                type="text" 
                value={amenityInput} 
                onChange={(e) => setAmenityInput(e.target.value)} 
                placeholder="Add an amenity..." 
              />
              <button onClick={handleAddAmenity} className="btn-secondary" type="button">Add</button>
            </div>
            <div className="amenities-list">
              {formData.amenities.map((amenity, index) => (
                <span key={index} className="amenity-tag" style={{cursor: 'pointer'}} onClick={() => handleRemoveAmenity(index)}>
                  {amenity} &times;
                </span>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Facility</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceFormModal;
