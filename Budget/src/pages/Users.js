import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { USER_ROLES } from '../utils/constants';
import toast from 'react-hot-toast';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'field_employee',
    phone: '',
    department: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await authService.updateUser(editingUser.id, formData);
        toast.success('User updated successfully');
      } else {
        await authService.register(formData);
        toast.success('User created successfully');
      }
      await loadUsers();
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      department: user.department || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await authService.deleteUser(id);
      toast.success('User deleted successfully');
      await loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'field_employee',
      phone: '',
      department: ''
    });
    setEditingUser(null);
    setShowModal(false);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'danger',
      manager: 'warning',
      contractor: 'info',
      field_employee: 'success'
    };
    return colors[role] || 'info';
  };

  return (
    <div className="main-content">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <FiPlus /> Add User
          </button>
        </div>

        <div className="card">
          {users.length === 0 ? (
            <div className="empty-state">
              <FiUsers className="empty-state-icon" />
              <h2 className="empty-state-title">No Users Found</h2>
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                <FiPlus /> Add First User
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge badge-${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>{user.department || '-'}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(user)} className="icon-btn edit">
                            <FiEdit2 />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="icon-btn delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editingUser ? 'Edit User' : 'New User'}</h2>
                <button onClick={resetForm} className="modal-close">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
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
                    <label className="form-label">Email *</label>
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
                      Password {!editingUser && '*'}
                      {editingUser && <span className="hint">(leave blank to keep current)</span>}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingUser}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      {Object.entries(USER_ROLES).map(([key, value]) => (
                        <option key={value} value={value}>
                          {value.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      name="department"
                      className="form-input"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Field Operations"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1-555-0100"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={resetForm} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Update' : 'Create'} User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
