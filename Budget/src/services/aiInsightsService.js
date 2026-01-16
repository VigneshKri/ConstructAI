import { logger } from './logger';

class AIInsightsService {
  // Mock AI service - in production, this would call actual AI APIs
  
  analyzeBudgetRisk(projects, expenses) {
    try {
      const insights = [];
      const risks = [];
      const recommendations = [];

      projects.forEach(project => {
        const projectExpenses = expenses.filter(e => e.projectId === project.id);
        const spent = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
        const percentUsed = (spent / project.budget) * 100;

        // Risk Analysis
        if (percentUsed > 90) {
          risks.push({
            level: 'critical',
            project: project.name,
            message: `Budget utilization at ${percentUsed.toFixed(1)}% - immediate action required`,
            impact: 'high',
            probability: 'high'
          });
          
          recommendations.push({
            project: project.name,
            action: 'Budget Review',
            priority: 'high',
            suggestion: 'Consider reallocating budget or reducing scope for non-critical items'
          });
        } else if (percentUsed > 75) {
          risks.push({
            level: 'warning',
            project: project.name,
            message: `Budget utilization at ${percentUsed.toFixed(1)}% - monitor closely`,
            impact: 'medium',
            probability: 'medium'
          });
        }

        // Spending Pattern Analysis
        const recentExpenses = projectExpenses
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);
        
        if (recentExpenses.length >= 5) {
          const avgExpense = recentExpenses.reduce((sum, e) => sum + e.amount, 0) / recentExpenses.length;
          const remaining = project.budget - spent;
          const estimatedDaysToComplete = 30; // Mock estimation
          const projectedSpend = avgExpense * (estimatedDaysToComplete / 7);

          if (projectedSpend > remaining) {
            insights.push({
              type: 'trend',
              project: project.name,
              message: `Current spending rate may exceed budget by ${((projectedSpend - remaining) / project.budget * 100).toFixed(1)}%`,
              prediction: 'budget_overrun',
              confidence: 75
            });

            recommendations.push({
              project: project.name,
              action: 'Spending Control',
              priority: 'medium',
              suggestion: 'Reduce daily expenditure by implementing stricter approval process'
            });
          }
        }

        // Category Analysis
        const categorySpending = {};
        projectExpenses.forEach(e => {
          categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
        });

        const topCategory = Object.keys(categorySpending).reduce((a, b) => 
          categorySpending[a] > categorySpending[b] ? a : b, 'Unknown'
        );

        if (categorySpending[topCategory] > spent * 0.5) {
          insights.push({
            type: 'category',
            project: project.name,
            message: `${topCategory} accounts for ${((categorySpending[topCategory] / spent) * 100).toFixed(1)}% of spending`,
            category: topCategory,
            amount: categorySpending[topCategory]
          });
        }
      });

      // Overall Portfolio Analysis
      const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
      const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
      const portfolioUtilization = (totalSpent / totalBudget) * 100;

      insights.push({
        type: 'portfolio',
        message: `Portfolio-wide budget utilization: ${portfolioUtilization.toFixed(1)}%`,
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent
      });

      // AI-powered recommendations
      if (risks.length === 0) {
        recommendations.push({
          project: 'Portfolio',
          action: 'Optimization',
          priority: 'low',
          suggestion: 'Budget management is on track. Consider investing in efficiency improvements.'
        });
      }

      return {
        risks: risks.sort((a, b) => this.getRiskScore(b) - this.getRiskScore(a)),
        insights,
        recommendations: recommendations.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority)),
        score: this.calculateHealthScore(totalBudget, totalSpent, risks.length),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to analyze budget risk', error);
      return {
        risks: [],
        insights: [],
        recommendations: [],
        score: 50,
        error: 'Analysis failed'
      };
    }
  }

  getRiskScore(risk) {
    const levelScore = { critical: 3, warning: 2, low: 1 };
    const impactScore = { high: 3, medium: 2, low: 1 };
    return (levelScore[risk.level] || 0) * (impactScore[risk.impact] || 1);
  }

  getPriorityScore(priority) {
    const scores = { high: 3, medium: 2, low: 1 };
    return scores[priority] || 0;
  }

  calculateHealthScore(totalBudget, totalSpent, riskCount) {
    const utilizationScore = Math.max(0, 100 - ((totalSpent / totalBudget) * 100));
    const riskPenalty = riskCount * 15;
    return Math.max(0, Math.min(100, utilizationScore - riskPenalty));
  }

  predictCashFlow(expenses, daysAhead = 30) {
    try {
      // Simple moving average prediction
      const sortedExpenses = expenses
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30);

      if (sortedExpenses.length < 7) {
        return null;
      }

      const dailyAverage = sortedExpenses.reduce((sum, e) => sum + e.amount, 0) / sortedExpenses.length;
      const prediction = [];

      for (let i = 1; i <= daysAhead; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        // Add some variance (±20%)
        const variance = (Math.random() - 0.5) * 0.4;
        const predictedAmount = dailyAverage * (1 + variance);

        prediction.push({
          date: date.toISOString().split('T')[0],
          predicted: predictedAmount,
          confidence: Math.max(60, 95 - (i * 1.5)) // Confidence decreases over time
        });
      }

      return {
        prediction,
        averageDailySpend: dailyAverage,
        totalPredicted: dailyAverage * daysAhead,
        confidence: 'medium'
      };
    } catch (error) {
      logger.error('Failed to predict cash flow', error);
      return null;
    }
  }

  analyzeInventoryRisk(inventoryItems) {
    try {
      const risks = [];
      const recommendations = [];

      const lowStock = inventoryItems.filter(item => 
        item.quantity <= item.reorderLevel && item.status === 'active'
      );

      const outOfStock = inventoryItems.filter(item => 
        item.quantity === 0 && item.status === 'active'
      );

      if (outOfStock.length > 0) {
        risks.push({
          level: 'critical',
          message: `${outOfStock.length} items are out of stock`,
          impact: 'high',
          items: outOfStock.map(i => i.name)
        });

        recommendations.push({
          action: 'Immediate Reorder',
          priority: 'high',
          suggestion: `Order ${outOfStock.map(i => i.name).join(', ')} immediately to prevent project delays`
        });
      }

      if (lowStock.length > 0) {
        risks.push({
          level: 'warning',
          message: `${lowStock.length} items are below reorder level`,
          impact: 'medium',
          items: lowStock.map(i => i.name)
        });

        recommendations.push({
          action: 'Stock Replenishment',
          priority: 'medium',
          suggestion: 'Plan reorder for low-stock items within the next week'
        });
      }

      // Overstocking analysis
      const avgValue = inventoryItems.reduce((sum, i) => sum + i.totalValue, 0) / inventoryItems.length;
      const highValue = inventoryItems.filter(i => i.totalValue > avgValue * 3);

      if (highValue.length > 0) {
        recommendations.push({
          action: 'Inventory Optimization',
          priority: 'low',
          suggestion: `Consider reducing stock levels for high-value items: ${highValue.map(i => i.name).join(', ')}`
        });
      }

      return {
        risks,
        recommendations,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length
      };
    } catch (error) {
      logger.error('Failed to analyze inventory risk', error);
      return { risks: [], recommendations: [], lowStockCount: 0, outOfStockCount: 0 };
    }
  }
}

export const aiInsightsService = new AIInsightsService();
