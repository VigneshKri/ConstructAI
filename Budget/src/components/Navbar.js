import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiFolder, FiDollarSign, FiBarChart2, 
  FiUsers, FiUser, FiLogOut, FiMenu, FiX, FiPackage, FiCpu 
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/projects', label: 'Projects', icon: <FiFolder /> },
    { path: '/expenses', label: 'Expenses', icon: <FiDollarSign /> },
    { path: '/inventory', label: 'Inventory', icon: <FiPackage /> },
    { path: '/reports', label: 'Reports', icon: <FiBarChart2 />, adminOnly: false },
    { path: '/ai-insights', label: 'AI Insights', icon: <FiCpu />, adminOnly: false },
    ...(isAdmin ? [{ path: '/users', label: 'Users', icon: <FiUsers />, adminOnly: true }] : [])
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <FiCpu className="brand-icon" />
          <span>ConstructAI</span>
        </Link>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-user">
            <Link 
              to="/profile" 
              className="user-profile"
              onClick={closeMobileMenu}
            >
              <FiUser />
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role?.replace('_', ' ')}</span>
              </div>
            </Link>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <FiLogOut />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
