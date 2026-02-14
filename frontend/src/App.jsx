import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VideoList from './pages/VideoList';
import VideoDetails from './pages/VideoDetails';
import CreateVideo from './pages/CreateVideo';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', width: '100vw', overflowX: 'hidden' }}>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-lg py-3">
          <div className="container-fluid px-5"> {/* px-5 keeps it airy but full width */}
            <Link className="navbar-brand d-flex align-items-center" to="/">
              <span style={{ fontSize: '1.8rem', marginRight: '12px' }}>🎞️</span>
              <span className="fw-bolder fs-3 tracking-tighter">SyncMonster <span className="text-primary">Studio</span></span>
            </Link>
            <div className="navbar-nav ms-auto align-items-center">
              <Link className="nav-item nav-link px-4 fw-bold" to="/">Workspace</Link>
              <Link className="btn btn-primary btn-lg ms-lg-3 px-5 rounded-pill shadow" to="/create">
                <span className="me-2">+</span> New Video
              </Link>
            </div>
          </div>
        </nav>

        {/* Changed container to container-fluid px-5 */}
        <div className="container-fluid px-5 py-5">
          <Routes>
            <Route path="/" element={<VideoList />} />
            <Route path="/video/:id" element={<VideoDetails />} />
            <Route path="/create" element={<CreateVideo />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;