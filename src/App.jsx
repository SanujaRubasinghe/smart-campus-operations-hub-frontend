import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CatalogueExplorer from './pages/CatalogueExplorer';
import './assets/css/catalog.css'; // Just in case, though it's imported in CatalogueExplorer too.

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="app-navbar">
          <div className="brand-title">Smart Campus Operations Hub</div>
          <div className="nav-links">
            <Link to="/" className="nav-link">Catalogue</Link>
            <Link to="/admin" className="nav-link">Admin Dashboard</Link>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<CatalogueExplorer />} />
            <Route path="/admin" element={
              <div className="catalog-container">
                <div className="empty-state">Admin Dashboard Placeholder</div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
