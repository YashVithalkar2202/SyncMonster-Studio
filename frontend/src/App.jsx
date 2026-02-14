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
  // Directly checking localStorage to ensure UI updates on refresh
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
          {/* Menu items sirf tab dikhenge jab user logged in ho */}
          {token && (
            <>
              <Link className="nav-item nav-link px-4 fw-bold text-white-50" to="/">Workspace</Link>
              <Link className="btn btn-primary btn-lg ms-lg-3 px-5 rounded-pill shadow me-3" to="/create">
                <span className="me-2">+</span> New Video
              </Link>
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

// --- Protected Route Wrapper ---
// Yeh component check karta hai ki user ke paas token hai ya nahi
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Agar token nahi hai, toh redirect to login
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
            {/* Protected Routes: Inhe access karne ke liye login zaroori hai */}
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

            {/* Public Route: Login page hamesha accessible rahega */}
            <Route path="/login" element={<Login />} />

            {/* Catch-all: Agar koi galat URL dale toh home par redirect (jo automatically auth check karega) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;