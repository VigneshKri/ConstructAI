import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { FiArrowLeft, FiDollarSign } from 'react-icons/fi';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById, getProjectExpenses } = useBudget();
  
  const project = getProjectById(id);
  const expenses = getProjectExpenses(id);

  if (!project) {
    return (
      <div className="main-content">
        <div className="page-container">
          <div className="card">
            <div className="empty-state">
              <h2>Project Not Found</h2>
              <p>The project you're looking for doesn't exist.</p>
              <Link to="/projects" className="btn btn-primary">
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = project.budget - totalSpent;
  const percentUsed = (totalSpent / project.budget) * 100;

  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { count: 0, total: 0 };
    }
    acc[expense.category].count += 1;
    acc[expense.category].total += expense.amount;
    return acc;
  }, {});

  const expensesByType = expenses.reduce((acc, expense) => {
    const type = expense.type || 'resource';
    if (!acc[type]) {
      acc[type] = { count: 0, total: 0 };
    }
    acc[type].count += 1;
    acc[type].total += expense.amount;
    return acc;
  }, {});

  return (
    <div className="main-content">
      <div className="page-container">
        <button onClick={() => navigate('/projects')} className="back-button">
          <FiArrowLeft /> Back to Projects
        </button>

        <div className="project-detail-header">
          <div>
            <h1 className="page-title">{project.name}</h1>
            <span className={`badge badge-${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="page-actions">
            <Link to={`/expenses?project=${id}`} className="btn btn-primary">
              <FiDollarSign /> Add Expense
            </Link>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h2>Project Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">{project.type}</span>
              </div>
              {project.location && (
                <div className="info-item">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{project.location}</span>
                </div>
              )}
              {project.startDate && (
                <div className="info-item">
                  <span className="info-label">Start Date:</span>
                  <span className="info-value">{formatDate(project.startDate)}</span>
                </div>
              )}
              {project.endDate && (
                <div className="info-item">
                  <span className="info-label">End Date:</span>
                  <span className="info-value">{formatDate(project.endDate)}</span>
                </div>
              )}
            </div>
            {project.description && (
              <div className="project-description-box">
                <strong>Description:</strong>
                <p>{project.description}</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Budget Overview</h2>
            <div className="budget-overview">
              <div className="budget-item">
                <span className="budget-label">Total Budget</span>
                <span className="budget-value primary">{formatCurrency(project.budget)}</span>
              </div>
              <div className="budget-item">
                <span className="budget-label">Total Spent</span>
                <span className={`budget-value ${percentUsed > 90 ? 'danger' : 'success'}`}>
                  {formatCurrency(totalSpent)}
                </span>
              </div>
              <div className="budget-item">
                <span className="budget-label">Remaining</span>
                <span className={`budget-value ${remaining < 0 ? 'danger' : 'success'}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
            <div className="progress-bar large">
              <div 
                className={`progress-fill ${percentUsed > 90 ? 'danger' : percentUsed > 75 ? 'warning' : 'success'}`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            <div className="progress-text">{percentUsed.toFixed(1)}% of budget used</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h2>Expenses by Category</h2>
            {Object.keys(expensesByCategory).length > 0 ? (
              <div className="category-list">
                {Object.entries(expensesByCategory)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([category, data]) => (
                    <div key={category} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{category}</span>
                        <span className="category-count">{data.count} items</span>
                      </div>
                      <span className="category-amount">{formatCurrency(data.total)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="no-data">No expenses recorded yet</p>
            )}
          </div>

          <div className="card">
            <h2>Expenses by Type</h2>
            {Object.keys(expensesByType).length > 0 ? (
              <div className="type-list">
                {Object.entries(expensesByType).map(([type, data]) => (
                  <div key={type} className="type-item">
                    <div className="type-header">
                      <span className={`badge badge-${type === 'capital' ? 'info' : 'success'}`}>
                        {type.toUpperCase()}
                      </span>
                      <span className="type-count">{data.count} items</span>
                    </div>
                    <div className="type-amount">{formatCurrency(data.total)}</div>
                    <div className="type-percentage">
                      {((data.total / totalSpent) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No expenses recorded yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Recent Expenses ({expenses.length})</h2>
          {expenses.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 10).map(expense => (
                    <tr key={expense.id}>
                      <td>{formatDate(expense.date)}</td>
                      <td>
                        <strong>{expense.itemName}</strong>
                        {expense.quantity && (
                          <div className="expense-quantity">
                            {expense.quantity} {expense.unit}
                          </div>
                        )}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <FiDollarSign className="empty-state-icon" />
              <p>No expenses recorded for this project yet</p>
              <Link to={`/expenses?project=${id}`} className="btn btn-primary">
                <FiDollarSign /> Add First Expense
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
