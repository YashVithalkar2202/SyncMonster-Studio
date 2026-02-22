import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import VideoList from './pages/VideoList';
import VideoDetails from './pages/VideoDetails';
import CreateVideo from './pages/CreateVideo';
import Login from './pages/Login';
import { logoutUser } from './api';

// --- Navbar Component ---
const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-lg py-3">
      <div className="container-fluid px-5">
        <Link className="navbar-brand d-flex align-items-center" to={token ? "/" : "/login"}>
          <span style={{ fontSize: '1.8rem', marginRight: '12px' }}>🎞️</span>
          <span className="fw-bolder fs-3 tracking-tighter">
            SyncMonster <span className="text-primary">Studio</span>
          </span>
        </Link>
        
        <div className="navbar-nav ms-auto align-items-center">
          {token && (
            <>
              <Link className="nav-item nav-link px-4 fw-bold text-white-50" to="/">Workspace</Link>
              <button 
                className="btn btn-outline-danger btn-lg px-4 rounded-pill fw-bold border-2"
                onClick={handleLogout}
              >
                Logout 🚪
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', width: '100vw', overflowX: 'hidden' }}>
        <Navbar />

        <div className="container-fluid px-5 py-5">
          <Routes>
            <Route 
              path="/" 
              element={<ProtectedRoute><VideoList /></ProtectedRoute>} 
            />
            <Route 
              path="/video/:id" 
              element={<ProtectedRoute><VideoDetails /></ProtectedRoute>} 
            />
            <Route 
              path="/create" 
              element={<ProtectedRoute><CreateVideo /></ProtectedRoute>} 
            />

            <Route path="/login" element={<Login />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;