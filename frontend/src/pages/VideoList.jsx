import React, { useEffect, useState } from 'react';
import { getVideos } from '../api';
import { Link } from 'react-router-dom';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10; 

  // CRITICAL FIX: The dependency array now includes [page, searchTerm]
  // This ensures the API is called whenever the page or search changes.
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await getVideos({ 
          page: page, 
          limit: limit, 
          search: searchTerm 
        });
        setVideos(response.data);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    };

    fetchVideos();
  }, [page, searchTerm]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Ready': return { bg: 'bg-success', text: 'text-white' };
      case 'Processing': return { bg: 'bg-primary', text: 'text-white' };
      case 'Failed': return { bg: 'bg-danger', text: 'text-white' };
      default: return { bg: 'bg-secondary', text: 'text-white' };
    }
  };

  return (
    <div className="w-100 animate__animated animate__fadeIn">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="display-4 fw-bold text-dark mb-0">Video Library</h1>
          <p className="lead text-muted">Manage your workspace assets and processing status.</p>
        </div>
        <Link to="/create" className="btn btn-primary btn-lg px-5 rounded-pill shadow-sm fw-bold">
          + Create New Asset
        </Link>
      </div>

{/* Professional Centered Search Section */}
<div className="row mb-5 justify-content-center">
  <div className="col-lg-6 col-md-8 col-sm-10">
    <div 
      className="position-relative shadow-lg rounded-pill overflow-hidden" 
      style={{ 
        transition: 'all 0.3s ease', 
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Icon positioned with better spacing */}
      <span 
        className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"
        style={{ fontSize: '1.2rem', zIndex: 10 }}
      >
        🔍
      </span>
      
      <input 
        type="text" 
        className="form-control form-control-lg border-0 ps-5 py-3 shadow-none" 
        style={{ 
          fontSize: '1.1rem', 
          borderRadius: '50px',
          paddingLeft: '3.5rem' // Extra padding to clear the icon
        }}
        placeholder="Search projects by name..." 
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(1);
        }}
      />
    </div>
    
    {/* Optional: Add a small "Results" hint under the bar */}
    {searchTerm && (
      <div className="text-center mt-2 animate__animated animate__fadeIn">
        <small className="text-muted">
          Showing results for <span className="fw-bold text-primary">"{searchTerm}"</span>
        </small>
      </div>
    )}
  </div>
</div>

      {/* Table Container */}
      <div className="card border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white">
              <tr>
                <th className="ps-5 py-4 fw-normal opacity-75">ASSET DETAILS</th>
                <th className="py-4 fw-normal opacity-75 text-center">STATUS</th>
                <th className="py-4 fw-normal opacity-75 text-center">DURATION</th>
                <th className="pe-5 py-4 fw-normal opacity-75 text-end">WORKFLOW</th>
              </tr>
            </thead>
            <tbody>
              {videos.length > 0 ? (
                videos.map(v => {
                  const cfg = getStatusConfig(v.status);
                  return (
                    <tr key={v.id} style={{ transition: '0.3s' }}>
                      <td className="ps-5 py-4">
                        <div className="d-flex align-items-center">
                          <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm" 
                               style={{ width: '55px', height: '55px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                            <span className="text-white fs-4">▶</span>
                          </div>
                          <div className="ms-4">
                            <h5 className="mb-0 fw-bold">{v.title}</h5>
                            <small className="text-muted">ID: #{v.id} • {v.description?.substring(0, 40)}...</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill px-4 py-2 fw-bold shadow-sm ${cfg.bg}`}>
                          {v.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-center fw-bold text-dark fs-5">
                        {v.duration} <small className="text-muted fw-normal">s</small>
                      </td>
                      <td className="pe-5 text-end">
                        <Link to={`/video/${v.id}`} className="btn btn-outline-dark rounded-pill px-4 fw-bold shadow-sm">
                          Open Editor ⚡
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">No assets found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Full-Width Pagination Bar */}
        <div className="d-flex justify-content-between align-items-center py-4 px-5 bg-light border-top">
          <div className="text-dark">
            Showing Page <span className="fw-bold">{page}</span>
          </div>
          <nav>
            <ul className="pagination mb-0 gap-2">
              <li className="page-item">
                <button 
                  className="btn btn-outline-dark rounded-pill px-4 fw-bold shadow-sm"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </button>
              </li>
              <li className="page-item">
                <button 
                  className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" 
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={videos.length < limit}
                >
                  Next →
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default VideoList;