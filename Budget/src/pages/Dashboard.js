import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';
import { 
  FiFolder, FiDollarSign, FiTrendingUp, FiAlertCircle,
  FiPlus, FiArrowRight
} from 'react-icons/fi';
import { formatCurrency, formatDate, getBudgetStatus } from '../utils/helpers';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { projects, expenses } = useBudget();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
    recentExpenses: []
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

  useEffect(() => {
    calculateStats();
  }, [projects, expenses]);

  const calculateStats = () => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const recentExpenses = [...expenses]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    setStats({
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      totalBudget,
      totalSpent,
      recentExpenses
    });
  };

  // Prepare data for Category Pie Chart
  const getCategoryData = () => {
    const categoryMap = {};
    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });
    
    return Object.keys(categoryMap).map(category => ({
      name: category,
      value: categoryMap[category]
    })).sort((a, b) => b.value - a.value).slice(0, 8);
  };

  // Prepare data for Project Budget Comparison Bar Chart
  const getProjectBudgetData = () => {
    return projects.slice(0, 6).map(project => {
      const projectExpenses = expenses.filter(e => e.projectId === project.id);
      const spent = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        name: project.name.substring(0, 20),
        Budget: project.budget,
        Spent: spent,
        Remaining: project.budget - spent
      };
    });
  };

  // Prepare data for Expense Trends Line Chart (Last 7 days)
  const getExpenseTrendData = () => {
    const days = 7;
    const today = new Date();
    const trendData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayExpenses = expenses.filter(e => e.date === dateStr);
      const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      trendData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: total
      });
    }
    
    return trendData;
  };

  const budgetStatus = getBudgetStatus(stats.totalSpent, stats.totalBudget);

  return (
    <div className="main-content">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.name}!</h1>
            <p className="page-subtitle">Here's your construction budget overview</p>
          </div>
          <div className="page-actions">
            <Link to="/projects" className="btn btn-primary">
              <FiPlus /> New Project
            </Link>
            <Link to="/expenses" className="btn btn-secondary">
              <FiDollarSign /> Add Expense
            </Link>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon primary">
              <FiFolder />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Projects</div>
              <div className="stat-value">{stats.totalProjects}</div>
              <div className="stat-change positive">
                {stats.activeProjects} active
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Budget</div>
              <div className="stat-value">{formatCurrency(stats.totalBudget)}</div>
              <div className="stat-change">Across all projects</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value">{formatCurrency(stats.totalSpent)}</div>
              <div className={`stat-change ${budgetStatus.status === 'danger' ? 'negative' : 'positive'}`}>
                {((stats.totalSpent / stats.totalBudget) * 100).toFixed(1)}% used
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon danger">
              <FiAlertCircle />
            </div>
            <div className="stat-content">
              <div className="stat-label">Budget Status</div>
              <div className="stat-value">
                <span className={`badge badge-${budgetStatus.status}`}>
                  {budgetStatus.text}
                </span>
              </div>
              <div className="stat-change">
                {formatCurrency(stats.totalBudget - stats.totalSpent)} remaining
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid-2">
          <div className="card">
            <h2>Expenses by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2>Project Budget Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getProjectBudgetData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="Budget" fill="#4CAF50" />
                <Bar dataKey="Spent" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>Expense Trends (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={getExpenseTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Daily Expenses"
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h2>Active Projects</h2>
              <Link to="/projects" className="btn btn-outline">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="project-list">
              {projects.filter(p => p.status === 'active').slice(0, 5).length > 0 ? (
                projects.filter(p => p.status === 'active').slice(0, 5).map((project) => {
                  const projectExpenses = expenses.filter(e => e.projectId === project.id);
                  const spent = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
                  const percentUsed = (spent / project.budget) * 100;

                  return (
                    <Link 
                      to={`/projects/${project.id}`} 
                      key={project.id}
                      className="project-item"
                    >
                      <div className="project-info">
                        <h3>{project.name}</h3>
                        <p>{project.location}</p>
                      </div>
                      <div className="project-budget">
                        <div className="budget-text">
                          <span>{formatCurrency(spent)}</span> / {formatCurrency(project.budget)}
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${percentUsed > 90 ? 'danger' : percentUsed > 75 ? 'warning' : 'success'}`}
                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="empty-state">
                  <FiFolder className="empty-icon" />
                  <p>No active projects yet</p>
                  <Link to="/projects" className="btn btn-primary">
                    <FiPlus /> Create Project
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Recent Expenses</h2>
              <Link to="/expenses" className="btn btn-outline">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="expense-list">
              {stats.recentExpenses.length > 0 ? (
                stats.recentExpenses.map((expense) => {
                  const project = projects.find(p => p.id === expense.projectId);
                  return (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-info">
                        <h4>{expense.itemName}</h4>
                        <p>{project?.name || 'Unknown Project'}</p>
                      </div>
                      <div className="expense-details">
                        <div className="expense-amount">{formatCurrency(expense.amount)}</div>
                        <div className="expense-date">{formatDate(expense.date)}</div>
                        <span className={`badge badge-${expense.type === 'capital' ? 'info' : 'success'}`}>
                          {expense.type}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <FiDollarSign className="empty-icon" />
                  <p>No expenses recorded yet</p>
                  <Link to="/expenses" className="btn btn-primary">
                    <FiPlus /> Add Expense
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
