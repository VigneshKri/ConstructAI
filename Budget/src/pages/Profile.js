import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { validateEmail, validatePhone } from '../utils/helpers';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="main-content">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary">
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-avatar">
              <FiUser />
            </div>
            
            <div className="profile-header">
              <h2>{user?.name}</h2>
              <span className={`badge badge-info`}>
                {user?.role?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">
                    <FiUser /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiMail /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiPhone /> Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1-555-0100"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiBriefcase /> Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Field Operations"
                  />
                </div>

                <div className="profile-actions">
                  <button type="button" onClick={handleCancel} className="btn btn-outline">
                    <FiX /> Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FiSave /> Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-icon"><FiUser /></span>
                  <div className="info-content">
                    <div className="info-label">Full Name</div>
                    <div className="info-value">{user?.name}</div>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon"><FiMail /></span>
                  <div className="info-content">
                    <div className="info-label">Email</div>
                    <div className="info-value">{user?.email}</div>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon"><FiPhone /></span>
                  <div className="info-content">
                    <div className="info-label">Phone</div>
                    <div className="info-value">{user?.phone || 'Not provided'}</div>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon"><FiBriefcase /></span>
                  <div className="info-content">
                    <div className="info-label">Department</div>
                    <div className="info-value">{user?.department || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="profile-sidebar">
            <div className="card">
              <h3>Account Information</h3>
              <div className="account-info">
                <div className="account-item">
                  <span className="account-label">Account Type</span>
                  <span className="account-value">{user?.role?.replace('_', ' ')}</span>
                </div>
                <div className="account-item">
                  <span className="account-label">Member Since</span>
                  <span className="account-value">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="account-item">
                  <span className="account-label">Last Login</span>
                  <span className="account-value">
                    {user?.loginAt ? new Date(user.loginAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Quick Stats</h3>
              <div className="quick-stats">
                <p className="stat-description">
                  View your dashboard to see detailed statistics about your projects and expenses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
