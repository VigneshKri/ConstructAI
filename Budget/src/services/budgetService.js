// Budget service for managing projects and expenses
export const budgetService = {
  createProject: (projectData) => {
    const project = {
      id: `project-${Date.now()}`,
      ...projectData,
      spent: 0,
      status: projectData.status || 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return project;
  },

  createExpense: (expenseData) => {
    const expense = {
      id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...expenseData,
      status: expenseData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return expense;
  },

  calculateProjectBudget: (project, expenses) => {
    const totalSpent = expenses
      .filter(e => e.projectId === project.id)
      .reduce((sum, e) => sum + e.amount, 0);

    const remaining = project.budget - totalSpent;
    const percentUsed = (totalSpent / project.budget) * 100;

    return {
      budget: project.budget,
      spent: totalSpent,
      remaining,
      percentUsed: Math.min(percentUsed, 100),
      isOverBudget: totalSpent > project.budget
    };
  },

  getExpensesByCategory: (expenses) => {
    const byCategory = {};
    
    expenses.forEach(expense => {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = {
          category: expense.category,
          total: 0,
          count: 0,
          items: []
        };
      }
      byCategory[expense.category].total += expense.amount;
      byCategory[expense.category].count += 1;
      byCategory[expense.category].items.push(expense);
    });

    return Object.values(byCategory);
  },

  getExpensesByType: (expenses) => {
    const byType = {
      capital: { total: 0, count: 0, items: [] },
      resource: { total: 0, count: 0, items: [] }
    };

    expenses.forEach(expense => {
      const type = expense.type || 'resource';
      byType[type].total += expense.amount;
      byType[type].count += 1;
      byType[type].items.push(expense);
    });

    return byType;
  },

  generateReport: (projects, expenses, dateRange) => {
    let filteredExpenses = expenses;

    if (dateRange && dateRange.start && dateRange.end) {
      filteredExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= new Date(dateRange.start) && 
               expenseDate <= new Date(dateRange.end);
      });
    }

    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = budgetService.getExpensesByCategory(filteredExpenses);
    const byType = budgetService.getExpensesByType(filteredExpenses);

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      percentUsed: (totalSpent / totalBudget) * 100,
      projectCount: projects.length,
      expenseCount: filteredExpenses.length,
      byCategory,
      byType,
      projects: projects.map(p => ({
        ...p,
        ...budgetService.calculateProjectBudget(p, filteredExpenses)
      }))
    };
  }
};
