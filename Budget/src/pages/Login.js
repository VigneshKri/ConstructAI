import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiFolder } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@construction.com', password: 'admin123', role: 'Admin' },
    { email: 'contractor@construction.com', password: 'contractor123', role: 'Contractor' },
    { email: 'field@construction.com', password: 'field123', role: 'Field Employee' }
  ];

  const quickLogin = (email, password) => {
    setCredentials({ email, password });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <FiFolder className="login-icon" />
          <h1>Construction Budget Manager</h1>
          <p>Track your construction expenses and manage budgets efficiently</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">
              <FiMail /> Email
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiLock /> Password
            </label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-accounts">
          <p className="demo-title">Demo Accounts (Quick Login):</p>
          <div className="demo-list">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => quickLogin(account.email, account.password)}
                className="demo-btn"
              >
                <strong>{account.role}</strong>
                <span>{account.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="login-footer">
          <p>Version 1.0.0 | Production Ready</p>
          <p>
            Features: Role-based access, Offline support, Real-time updates, 
            Budget tracking, Expense management, Reports & Analytics
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
