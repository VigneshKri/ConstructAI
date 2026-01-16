import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiX, FiFilter } from 'react-icons/fi';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { EXPENSE_TYPES, EXPENSE_CATEGORIES, EXPENSE_STATUS } from '../utils/constants';
import toast from 'react-hot-toast';
import './Expenses.css';

const Expenses = () => {
  const { projects, expenses, addExpense, updateExpense, deleteExpense } = useBudget();
  const { user, isAdmin, isManager } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterProject, setFilterProject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    projectId: '',
    itemName: '',
    description: '',
    category: 'Materials',
    type: 'resource',
    amount: '',
    quantity: '',
    unit: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    vendor: '',
    receiptNumber: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['amount', 'quantity'].includes(name) ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.itemName || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingExpense) {
        updateExpense(editingExpense.id, formData);
      } else {
        addExpense({
          ...formData,
          createdBy: user.id
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      projectId: expense.projectId,
      itemName: expense.itemName,
      description: expense.description || '',
      category: expense.category,
      type: expense.type,
      amount: expense.amount,
      quantity: expense.quantity || '',
      unit: expense.unit || '',
      date: expense.date,
      status: expense.status,
      vendor: expense.vendor || '',
      receiptNumber: expense.receiptNumber || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: '',
      itemName: '',
      description: '',
      category: 'Materials',
      type: 'resource',
      amount: '',
      quantity: '',
      unit: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      vendor: '',
      receiptNumber: ''
    });
    setEditingExpense(null);
    setShowModal(false);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filterProject !== 'all' && expense.projectId !== filterProject) return false;
    if (filterType !== 'all' && expense.type !== filterType) return false;
    return true;
  });

  const canEdit = isAdmin || isManager;

  return (
    <div className="main-content">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Expenses</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <FiPlus /> Add Expense
          </button>
        </div>

        <div className="card">
          <div className="filters">
            <div className="filter-group">
              <FiFilter />
              <select 
                value={filterProject} 
                onChange={(e) => setFilterProject(e.target.value)}
                className="form-select"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="form-select"
              >
                <option value="all">All Types</option>
                <option value="capital">Capital</option>
                <option value="resource">Resource</option>
              </select>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <FiDollarSign className="empty-state-icon" />
              <h2 className="empty-state-title">No Expenses Found</h2>
              <p className="empty-state-description">
                {expenses.length === 0 
                  ? 'Start tracking your construction expenses'
                  : 'No expenses match your filters'}
              </p>
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                <FiPlus /> Add Expense
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(expense => {
                    const project = projects.find(p => p.id === expense.projectId);
                    return (
                      <tr key={expense.id}>
                        <td>{formatDate(expense.date)}</td>
                        <td>{project?.name || 'Unknown'}</td>
                        <td>
                          <div>
                            <strong>{expense.itemName}</strong>
                            {expense.quantity && (
                              <div className="expense-quantity">
                                {expense.quantity} {expense.unit}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{expense.category}</td>
                        <td>
                          <span className={`badge badge-${expense.type === 'capital' ? 'info' : 'success'}`}>
                            {expense.type}
                          </span>
                        </td>
                        <td><strong>{formatCurrency(expense.amount)}</strong></td>
                        <td>
                          <span className={`badge badge-${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleEdit(expense)} className="icon-btn edit">
                              <FiEdit2 />
                            </button>
                            {canEdit && (
                              <button onClick={() => handleDelete(expense.id)} className="icon-btn delete">
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editingExpense ? 'Edit Expense' : 'New Expense'}</h2>
                <button onClick={resetForm} className="modal-close">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Project *</label>
                    <select
                      name="projectId"
                      className="form-select"
                      value={formData.projectId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Item Name *</label>
                      <input
                        type="text"
                        name="itemName"
                        className="form-input"
                        value={formData.itemName}
                        onChange={handleInputChange}
                        placeholder="e.g., Concrete, Steel Beams"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date *</label>
                      <input
                        type="date"
                        name="date"
                        className="form-input"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Additional details..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        name="category"
                        className="form-select"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        {Object.values(EXPENSE_CATEGORIES).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select
                        name="type"
                        className="form-select"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        <option value="capital">Capital</option>
                        <option value="resource">Resource</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Amount ($) *</label>
                      <input
                        type="number"
                        name="amount"
                        className="form-input"
                        value={formData.amount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        className="form-input"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Unit</label>
                      <input
                        type="text"
                        name="unit"
                        className="form-input"
                        value={formData.unit}
                        onChange={handleInputChange}
                        placeholder="e.g., tons, pieces"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Vendor</label>
                      <input
                        type="text"
                        name="vendor"
                        className="form-input"
                        value={formData.vendor}
                        onChange={handleInputChange}
                        placeholder="Supplier name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Receipt/Invoice #</label>
                      <input
                        type="text"
                        name="receiptNumber"
                        className="form-input"
                        value={formData.receiptNumber}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        {Object.entries(EXPENSE_STATUS).map(([key, value]) => (
                          <option key={key} value={value}>{value.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={resetForm} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingExpense ? 'Update' : 'Add'} Expense
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

export default Expenses;
