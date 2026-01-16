import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { inventoryService } from '../services/inventoryService';
import { aiInsightsService } from '../services/aiInsightsService';
import { 
  FiAlertTriangle, FiCpu, FiTrendingUp, FiCheckCircle,
  FiAlertCircle, FiTarget, FiActivity 
} from 'react-icons/fi';
import { formatCurrency } from '../utils/helpers';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './AIInsights.css';

const AIInsights = () => {
  const { projects, expenses } = useBudget();
  const [analysis, setAnalysis] = useState(null);
  const [inventoryRisk, setInventoryRisk] = useState(null);
  const [cashFlowPrediction, setCashFlowPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  const RISK_COLORS = {
    critical: '#DC3545',
    warning: '#FFC107',
    low: '#28A745'
  };

  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, expenses]);

  const runAnalysis = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Budget Risk Analysis
      const budgetAnalysis = aiInsightsService.analyzeBudgetRisk(projects, expenses);
      setAnalysis(budgetAnalysis);

      // Inventory Risk Analysis
      const items = inventoryService.getAllItems();
      const invRisk = aiInsightsService.analyzeInventoryRisk(items);
      setInventoryRisk(invRisk);

      // Cash Flow Prediction
      const prediction = aiInsightsService.predictCashFlow(expenses, 14);
      setCashFlowPrediction(prediction);

      setLoading(false);
    }, 1000);
  };

  const getHealthColor = (score) => {
    if (score >= 70) return '#28A745';
    if (score >= 40) return '#FFC107';
    return '#DC3545';
  };

  const getHealthStatus = (score) => {
    if (score >= 70) return 'Excellent';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  };

  const getRiskLevelData = () => {
    if (!analysis) return [];
    
    const counts = { critical: 0, warning: 0, low: 0 };
    analysis.risks.forEach(risk => {
      counts[risk.level] = (counts[risk.level] || 0) + 1;
    });

    return [
      { name: 'Critical', value: counts.critical, color: RISK_COLORS.critical },
      { name: 'Warning', value: counts.warning, color: RISK_COLORS.warning },
      { name: 'Low', value: counts.low || 0, color: RISK_COLORS.low }
    ].filter(item => item.value > 0);
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing data with AI...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <FiCpu /> AI-Powered Insights
            </h1>
            <p className="page-subtitle">Budget risk analysis, predictions, and intelligent recommendations</p>
          </div>
          <button onClick={runAnalysis} className="btn btn-primary">
            <FiActivity /> Refresh Analysis
          </button>
        </div>

        {/* Health Score */}
        <div className="card health-score-card">
          <div className="health-score-content">
            <div className="health-score-circle" style={{ '--score-color': getHealthColor(analysis?.score || 50) }}>
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e9ecef" strokeWidth="8"/>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="var(--score-color)" 
                  strokeWidth="8"
                  strokeDasharray={`${(analysis?.score || 50) * 2.83} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="health-score-value">
                <span className="score-number">{analysis?.score || 50}</span>
                <span className="score-label">Health Score</span>
              </div>
            </div>
            <div className="health-score-details">
              <h2>Budget Health: {getHealthStatus(analysis?.score || 50)}</h2>
              <p>
                {analysis?.risks.length === 0 
                  ? 'All projects are within budget parameters. Continue monitoring for optimal performance.'
                  : `${analysis?.risks.length} risk factors identified. Review recommendations below.`}
              </p>
              <div className="health-metrics">
                <div className="metric">
                  <span className="metric-label">Total Budget</span>
                  <span className="metric-value">{formatCurrency(analysis?.insights.find(i => i.type === 'portfolio')?.totalBudget || 0)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Total Spent</span>
                  <span className="metric-value">{formatCurrency(analysis?.insights.find(i => i.type === 'portfolio')?.totalSpent || 0)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Remaining</span>
                  <span className="metric-value success">{formatCurrency(analysis?.insights.find(i => i.type === 'portfolio')?.remaining || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="grid-2">
          <div className="card">
            <h2><FiAlertTriangle /> Risk Distribution</h2>
            {getRiskLevelData().length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getRiskLevelData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getRiskLevelData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <FiCheckCircle className="empty-icon success" />
                <p>No risks detected</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2><FiActivity /> Inventory Status</h2>
            <div className="inventory-risk-summary">
              <div className="risk-item">
                <FiAlertCircle className={inventoryRisk?.outOfStockCount > 0 ? 'text-danger' : 'text-success'} />
                <div>
                  <strong>{inventoryRisk?.outOfStockCount || 0}</strong>
                  <span>Out of Stock</span>
                </div>
              </div>
              <div className="risk-item">
                <FiAlertTriangle className={inventoryRisk?.lowStockCount > 0 ? 'text-warning' : 'text-success'} />
                <div>
                  <strong>{inventoryRisk?.lowStockCount || 0}</strong>
                  <span>Low Stock Items</span>
                </div>
              </div>
              <div className="risk-item">
                <FiCheckCircle className="text-success" />
                <div>
                  <strong>{inventoryService.getAllItems().length}</strong>
                  <span>Total Items</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Risks */}
        {analysis?.risks.length > 0 && (
          <div className="card">
            <h2><FiAlertTriangle /> Identified Risks</h2>
            <div className="risks-list">
              {analysis.risks.map((risk, index) => (
                <div key={index} className={`risk-card risk-${risk.level}`}>
                  <div className="risk-header">
                    <div className="risk-badge">
                      <span className={`badge badge-${risk.level === 'critical' ? 'danger' : 'warning'}`}>
                        {risk.level.toUpperCase()}
                      </span>
                      <span className="risk-impact">{risk.impact} impact</span>
                    </div>
                    {risk.project && <span className="risk-project">{risk.project}</span>}
                  </div>
                  <p className="risk-message">{risk.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis?.recommendations.length > 0 && (
          <div className="card">
            <h2><FiTarget /> AI Recommendations</h2>
            <div className="recommendations-list">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-header">
                    <span className={`priority-badge priority-${rec.priority}`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="recommendation-action">{rec.action}</span>
                  </div>
                  {rec.project && <div className="recommendation-project">{rec.project}</div>}
                  <p className="recommendation-text">{rec.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cash Flow Prediction */}
        {cashFlowPrediction && (
          <div className="card">
            <h2><FiTrendingUp /> Cash Flow Forecast (Next 14 Days)</h2>
            <div className="forecast-summary">
              <div className="forecast-stat">
                <span className="label">Average Daily Spend</span>
                <span className="value">{formatCurrency(cashFlowPrediction.averageDailySpend)}</span>
              </div>
              <div className="forecast-stat">
                <span className="label">Predicted Total</span>
                <span className="value">{formatCurrency(cashFlowPrediction.totalPredicted)}</span>
              </div>
              <div className="forecast-stat">
                <span className="label">Confidence</span>
                <span className="value">{cashFlowPrediction.confidence}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlowPrediction.prediction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                  name="Predicted Spending"
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="forecast-note">
              * Prediction based on historical spending patterns. Confidence decreases over time.
            </p>
          </div>
        )}

        {/* Insights */}
        {analysis?.insights.filter(i => i.type !== 'portfolio').length > 0 && (
          <div className="card">
            <h2><FiCpu /> AI Insights</h2>
            <div className="insights-grid">
              {analysis.insights
                .filter(i => i.type !== 'portfolio')
                .map((insight, index) => (
                  <div key={index} className="insight-card">
                    <div className="insight-type">
                      {insight.type === 'trend' && <FiTrendingUp />}
                      {insight.type === 'category' && <FiTarget />}
                      <span>{insight.type.toUpperCase()}</span>
                    </div>
                    <p className="insight-message">{insight.message}</p>
                    {insight.project && <div className="insight-project">Project: {insight.project}</div>}
                    {insight.confidence && (
                      <div className="insight-confidence">Confidence: {insight.confidence}%</div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Inventory Recommendations */}
        {inventoryRisk?.recommendations.length > 0 && (
          <div className="card">
            <h2><FiTarget /> Inventory Recommendations</h2>
            <div className="recommendations-list">
              {inventoryRisk.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-header">
                    <span className={`priority-badge priority-${rec.priority}`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="recommendation-action">{rec.action}</span>
                  </div>
                  <p className="recommendation-text">{rec.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
