import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { FiDownload, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { formatCurrency, exportToCSV, getDateRangePreset } from '../utils/helpers';
import { budgetService } from '../services/budgetService';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Reports.css';

const Reports = () => {
  const { projects, expenses } = useBudget();
  const [dateRange, setDateRange] = useState('all');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D', '#A569BD', '#45B7D1'];

  const getFilteredExpenses = () => {
    if (dateRange === 'all') return expenses;
    
    const range = getDateRangePreset(dateRange);
    if (!range.start || !range.end) return expenses;

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= range.start && expenseDate <= range.end;
    });
  };

  const filteredExpenses = getFilteredExpenses();
  const report = budgetService.generateReport(projects, filteredExpenses, null);

  // Prepare chart data
  const getCategoryChartData = () => {
    return report.byCategory.map(cat => ({
      name: cat.category,
      value: cat.total,
      count: cat.count
    }));
  };

  const getTypeComparisonData = () => {
    return [
      { name: 'Capital', amount: report.byType.capital.total, count: report.byType.capital.count },
      { name: 'Resource', amount: report.byType.resource.total, count: report.byType.resource.count }
    ];
  };

  const getProjectComparisonData = () => {
    return report.projects.slice(0, 8).map(p => ({
      name: p.name.substring(0, 15),
      Budget: p.budget,
      Spent: p.spent,
      Remaining: Math.max(0, p.remaining)
    }));
  };

  const getMonthlyTrendData = () => {
    const monthlyData = {};
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          capital: 0,
          resource: 0,
          total: 0
        };
      }
      
      if (expense.type === 'capital') {
        monthlyData[monthKey].capital += expense.amount;
      } else {
        monthlyData[monthKey].resource += expense.amount;
      }
      monthlyData[monthKey].total += expense.amount;
    });
    
    return Object.keys(monthlyData)
      .sort()
      .slice(-6)
      .map(key => monthlyData[key]);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Construction Budget Report', 14, 22);
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total Projects: ${report.projectCount}`, 14, 40);
    doc.text(`Total Budget: ${formatCurrency(report.totalBudget)}`, 14, 48);
    doc.text(`Total Spent: ${formatCurrency(report.totalSpent)}`, 14, 56);
    doc.text(`Remaining: ${formatCurrency(report.totalRemaining)}`, 14, 64);
    
    // Projects Table
    doc.autoTable({
      startY: 75,
      head: [['Project', 'Budget', 'Spent', 'Remaining', 'Status']],
      body: report.projects.map(p => [
        p.name,
        formatCurrency(p.budget),
        formatCurrency(p.spent),
        formatCurrency(p.remaining),
        p.status
      ])
    });
    
    // Save
    doc.save('budget-report.pdf');
  };

  const exportToCSVFile = () => {
    const data = filteredExpenses.map(expense => {
      const project = projects.find(p => p.id === expense.projectId);
      return {
        Date: expense.date,
        Project: project?.name || 'Unknown',
        Item: expense.itemName,
        Category: expense.category,
        Type: expense.type,
        Amount: expense.amount,
        Status: expense.status,
        Vendor: expense.vendor || '',
        Receipt: expense.receiptNumber || ''
      };
    });
    
    exportToCSV(data, `expenses-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="main-content">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Reports & Analytics</h1>
          <div className="page-actions">
            <button onClick={exportToCSVFile} className="btn btn-outline">
              <FiDownload /> Export CSV
            </button>
            <button onClick={exportToPDF} className="btn btn-primary">
              <FiDownload /> Export PDF
            </button>
          </div>
        </div>

        <div className="card">
          <div className="filter-bar">
            <label>Date Range:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="form-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon primary">
              <FiBarChart2 />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Budget</div>
              <div className="stat-value">{formatCurrency(report.totalBudget)}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <FiBarChart2 />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value">{formatCurrency(report.totalSpent)}</div>
              <div className="stat-change">{report.percentUsed.toFixed(1)}% of budget</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <FiBarChart2 />
            </div>
            <div className="stat-content">
              <div className="stat-label">Remaining</div>
              <div className="stat-value">{formatCurrency(report.totalRemaining)}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon info">
              <FiPieChart />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Expenses</div>
              <div className="stat-value">{report.expenseCount}</div>
              <div className="stat-change">{report.projectCount} projects</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid-2">
          <div className="card">
            <h2>Expenses by Category (Pie Chart)</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={getCategoryChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${formatCurrency(value)} (${props.payload.count} items)`,
                    name
                  ]} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2>Capital vs Resource Expenses</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={getTypeComparisonData()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, amount, count }) => `${name}: ${formatCurrency(amount)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${formatCurrency(value)} (${props.payload.count} items)`,
                    name
                  ]} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>Project Budget Analysis (Bar Chart)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={getProjectComparisonData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Budget" fill="#4CAF50" />
              <Bar dataKey="Spent" fill="#FF6B6B" />
              <Bar dataKey="Remaining" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Monthly Expense Trends (Area Chart)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={getMonthlyTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="capital" 
                stackId="1"
                stroke="#0088FE" 
                fill="#0088FE"
                name="Capital Expenses"
              />
              <Area 
                type="monotone" 
                dataKey="resource" 
                stackId="1"
                stroke="#00C49F" 
                fill="#00C49F"
                name="Resource Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid-2">
          <div className="card">
            <h2>Expenses by Category</h2>
            <div className="report-list">
              {report.byCategory.map(cat => (
                <div key={cat.category} className="report-item">
                  <div className="report-info">
                    <span className="report-name">{cat.category}</span>
                    <span className="report-count">{cat.count} items</span>
                  </div>
                  <div className="report-values">
                    <span className="report-amount">{formatCurrency(cat.total)}</span>
                    <span className="report-percentage">
                      {((cat.total / report.totalSpent) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Expenses by Type</h2>
            <div className="type-breakdown">
              <div className="type-card capital">
                <div className="type-header">
                  <span className="badge badge-info">CAPITAL</span>
                  <span className="type-count">{report.byType.capital.count} items</span>
                </div>
                <div className="type-amount">{formatCurrency(report.byType.capital.total)}</div>
                <div className="type-percentage">
                  {((report.byType.capital.total / report.totalSpent) * 100).toFixed(1)}% of total
                </div>
              </div>

              <div className="type-card resource">
                <div className="type-header">
                  <span className="badge badge-success">RESOURCE</span>
                  <span className="type-count">{report.byType.resource.count} items</span>
                </div>
                <div className="type-amount">{formatCurrency(report.byType.resource.total)}</div>
                <div className="type-percentage">
                  {((report.byType.resource.total / report.totalSpent) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Project Budget Summary</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Type</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>% Used</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.projects.map(project => (
                  <tr key={project.id}>
                    <td><strong>{project.name}</strong></td>
                    <td>{project.type}</td>
                    <td>{formatCurrency(project.budget)}</td>
                    <td>{formatCurrency(project.spent)}</td>
                    <td className={project.remaining < 0 ? 'text-danger' : ''}>
                      {formatCurrency(project.remaining)}
                    </td>
                    <td>
                      <span className={project.percentUsed > 90 ? 'text-danger' : project.percentUsed > 75 ? 'text-warning' : ''}>
                        {project.percentUsed.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${project.status === 'active' ? 'success' : 'info'}`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
