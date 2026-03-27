import React, { useState, useEffect } from 'react';
import { fetchCatalogue, createResource, updateResource, deleteResource } from '../services/api';
import ResourceFormModal from '../components/admin/ResourceFormModal';
import '../assets/css/catalog.css';

const AdminDashboard = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch a larger page size for the admin table
      const data = await fetchCatalogue(0, 100);
      setResources(Array.isArray(data) ? data : data.content || []);
      setError(null);
    } catch (err) {
      setError('Unable to load facilities for administration.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (resource = null) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingResource(null);
    setIsModalOpen(false);
  };

  const handleSave = async (formData) => {
    try {
      if (editingResource) {
        await updateResource(editingResource.id, formData);
      } else {
        await createResource(formData);
      }
      handleCloseModal();
      loadData(); // Refresh table
    } catch (err) {
      alert('Failed to save resource. Ensure your backend endpoints are implemented properly.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this facility?')) {
      try {
        await deleteResource(id);
        loadData();
      } catch (err) {
        alert('Failed to delete resource.');
      }
    }
  };

  if (isLoading) return <div className="catalog-container" style={{textAlign: 'center', padding: '4rem'}}>Loading dashboard...</div>;

  return (
    <div className="catalog-container">
      <div className="admin-header">
        <h1>Facilities Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add New Facility</button>
      </div>

      {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: '#86868b'}}>No facilities found in database.</td>
              </tr>
            ) : resources.map(res => (
              <tr key={res.id}>
                <td>{res.name}</td>
                <td style={{fontSize: '0.8rem', color: '#86868b'}}>{res.type}</td>
                <td>{res.capacity}</td>
                <td>
                  <span className={`badge ${res.status === 'ACTIVE' ? 'badge-active' : 'badge-out_of_service'}`}>
                    {res.status}
                  </span>
                </td>
                <td className="action-buttons">
                  <button className="btn-secondary" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => handleOpenModal(res)}>Edit</button>
                  <button className="btn-danger" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => handleDelete(res.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ResourceFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSave} 
        initialData={editingResource} 
      />
    </div>
  );
};

export default AdminDashboard;
