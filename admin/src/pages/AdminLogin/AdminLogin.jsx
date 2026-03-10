import React, { useState } from 'react';
import './AdminLogin.css';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

const AdminLogin = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === 'admin') {
      setToken('admin-token');
      navigate("/");
    } else {
      alert('Invalid credentials!');
    }
  };

  return (
    <div className="login-page">
      <div className="glass-container">
        <div className="login-card">
          <div className="login-header">
            <img src={assets.mat_logo} alt="MAT Logo" className="mat-logo" />
            <h1>Admin Panel</h1>
            <p>Welcome back! </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-block">
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-block">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">
              Submit
            </button>
          </form>

          <div className="login-footer">
            <p>&copy; 2026 MAT TEXTILE HUB Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
