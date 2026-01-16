import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiX } from 'react-icons/fi';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { PROJECT_STATUS, PROJECT_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';
import './Projects.css';

const Projects = () => {
  const { projects, expenses, addProject, updateProject, deleteProject } = useBudget();
  const { user, isAdmin, isManager } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Residential Construction',
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'planning'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.budget) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingProject) {
        updateProject(editingProject.id, formData);
      } else {
        addProject({
          ...formData,
          createdBy: user.id
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      type: project.type,
      location: project.location || '',
      budget: project.budget,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      status: project.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project? All related expenses will also be deleted.')) {
      deleteProject(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'Residential Construction',
      location: '',
      budget: '',
      startDate: '',
      endDate: '',
      status: 'planning'
    });
    setEditingProject(null);
    setShowModal(false);
  };

  const getProjectSpent = (projectId) => {
    return expenses
      .filter(e => e.projectId === projectId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const canEdit = isAdmin || isManager;

  return (
    <div className="main-content">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Projects</h1>
          {canEdit && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <FiPlus /> New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <FiFolder className="empty-state-icon" />
              <h2 className="empty-state-title">No Projects Yet</h2>
              <p className="empty-state-description">
                Create your first construction project to start tracking budgets and expenses
              </p>
              {canEdit && (
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                  <FiPlus /> Create Project
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => {
              const spent = getProjectSpent(project.id);
              const remaining = project.budget - spent;
              const percentUsed = (spent / project.budget) * 100;

              return (
                <div key={project.id} className="project-card">
                  <div className="project-card-header">
                    <div>
                      <h3>{project.name}</h3>
                      <span className={`badge badge-${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    {canEdit && (
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(project)} className="icon-btn edit">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(project.id)} className="icon-btn delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="project-card-body">
                    <p className="project-type">{project.type}</p>
                    {project.location && <p className="project-location">📍 {project.location}</p>}
                    {project.description && <p className="project-description">{project.description}</p>}

                    <div className="project-dates">
                      {project.startDate && (
                        <div>Start: {formatDate(project.startDate)}</div>
                      )}
                      {project.endDate && (
                        <div>End: {formatDate(project.endDate)}</div>
                      )}
                    </div>

                    <div className="project-budget-info">
                      <div className="budget-row">
                        <span>Budget:</span>
                        <strong>{formatCurrency(project.budget)}</strong>
                      </div>
                      <div className="budget-row">
                        <span>Spent:</span>
                        <strong className={percentUsed > 90 ? 'text-danger' : ''}>{formatCurrency(spent)}</strong>
                      </div>
                      <div className="budget-row">
                        <span>Remaining:</span>
                        <strong className={remaining < 0 ? 'text-danger' : 'text-success'}>
                          {formatCurrency(remaining)}
                        </strong>
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${percentUsed > 90 ? 'danger' : percentUsed > 75 ? 'warning' : 'success'}`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                    <div className="progress-text">{percentUsed.toFixed(1)}% used</div>
                  </div>

                  <div className="project-card-footer">
                    <Link to={`/projects/${project.id}`} className="btn btn-outline">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                <button onClick={resetForm} className="modal-close">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Project Name *</label>
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
                    <label className="form-label">Project Type</label>
                    <select
                      name="type"
                      className="form-select"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      {Object.values(PROJECT_TYPES).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="form-input"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, State"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Budget ($) *</label>
                    <input
                      type="number"
                      name="budget"
                      className="form-input"
                      value={formData.budget}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-input"
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        className="form-input"
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      {Object.entries(PROJECT_STATUS).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={resetForm} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProject ? 'Update' : 'Create'} Project
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

export default Projects;
