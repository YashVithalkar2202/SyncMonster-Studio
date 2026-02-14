import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';

const Login = () => {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(creds.username, creds.password);
      navigate('/'); // Login ke baad library par jayein
    } catch (err) {
      alert("Invalid Credentials!");
    }
  };

  return (
    <div className="row justify-content-center py-5">
      <div className="col-md-4">
        <div className="card shadow-lg border-0 p-4" style={{ borderRadius: '25px' }}>
          <h2 className="text-center fw-bold mb-4">Studio Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-floating mb-3">
              <input className="form-control rounded-4" placeholder="User" 
                onChange={e => setCreds({...creds, username: e.target.value})} />
              <label>Username</label>
            </div>
            <div className="form-floating mb-4">
              <input type="password" className="form-control rounded-4" placeholder="Pass" 
                onChange={e => setCreds({...creds, password: e.target.value})} />
              <label>Password</label>
            </div>
            <button className="btn btn-primary w-100 py-3 rounded-pill shadow">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;