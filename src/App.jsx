import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import CatalogueExplorer from './pages/CatalogueExplorer';
import AdminDashboard from './pages/AdminDashboard';
import './assets/css/catalog.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="app-navbar">
          <div className="brand-title">Smart Campus Operations Hub</div>
          <div className="nav-links">
            <NavLink 
              to="/" 
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Catalogue
            </NavLink>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Admin Dashboard
            </NavLink>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<CatalogueExplorer />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
