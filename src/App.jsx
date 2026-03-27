import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import CatalogueExplorer from './pages/CatalogueExplorer'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-layout">
        <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #eee', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#007bff' }}>Smart Campus</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Home</Link>
            <Link to="/catalog" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Facilities Catalog</Link>
          </div>
        </nav>
        
        <main>
          <Routes>
            <Route path="/" element={
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Welcome to Smart Campus Operations Hub</h2>
                <p>Select "Facilities Catalog" to begin exploring campuses spaces.</p>
                <Link to="/catalog">
                  <button style={{ padding: '0.8rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}>
                    Open Catalog
                  </button>
                </Link>
              </div>
            } />
            <Route path="/catalog" element={<CatalogueExplorer />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
