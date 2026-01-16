import React, { createContext, useContext, useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { storageService } from '../services/storageService';
import toast from 'react-hot-toast';

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedProjects = storageService.getProjects();
    const storedExpenses = storageService.getExpenses();
    setProjects(storedProjects);
    setExpenses(storedExpenses);
  };

  // Project Management
  const addProject = (projectData) => {
    try {
      const newProject = budgetService.createProject(projectData);
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      storageService.setProjects(updatedProjects);
      toast.success('Project created successfully');
      return newProject;
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
      throw error;
    }
  };

  const updateProject = (id, projectData) => {
    try {
      const updatedProjects = projects.map(p =>
        p.id === id ? { ...p, ...projectData, updatedAt: new Date().toISOString() } : p
      );
      setProjects(updatedProjects);
      storageService.setProjects(updatedProjects);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update project');
      throw error;
    }
  };

  const deleteProject = (id) => {
    try {
      const updatedProjects = projects.filter(p => p.id !== id);
      const updatedExpenses = expenses.filter(e => e.projectId !== id);
      setProjects(updatedProjects);
      setExpenses(updatedExpenses);
      storageService.setProjects(updatedProjects);
      storageService.setExpenses(updatedExpenses);
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
      throw error;
    }
  };

  // Expense Management
  const addExpense = (expenseData) => {
    try {
      const newExpense = budgetService.createExpense(expenseData);
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      storageService.setExpenses(updatedExpenses);
      
      // Update project spent amount
      const project = projects.find(p => p.id === expenseData.projectId);
      if (project) {
        const projectExpenses = updatedExpenses.filter(e => e.projectId === project.id);
        const totalSpent = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
        updateProject(project.id, { spent: totalSpent });
      }
      
      toast.success('Expense added successfully');
      return newExpense;
    } catch (error) {
      toast.error(error.message || 'Failed to add expense');
      throw error;
    }
  };

  const updateExpense = (id, expenseData) => {
    try {
      const updatedExpenses = expenses.map(e =>
        e.id === id ? { ...e, ...expenseData, updatedAt: new Date().toISOString() } : e
      );
      setExpenses(updatedExpenses);
      storageService.setExpenses(updatedExpenses);
      
      // Update project spent amount
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        const projectExpenses = updatedExpenses.filter(e => e.projectId === expense.projectId);
        const totalSpent = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
        updateProject(expense.projectId, { spent: totalSpent });
      }
      
      toast.success('Expense updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update expense');
      throw error;
    }
  };

  const deleteExpense = (id) => {
    try {
      const expense = expenses.find(e => e.id === id);
      const updatedExpenses = expenses.filter(e => e.id !== id);
      setExpenses(updatedExpenses);
      storageService.setExpenses(updatedExpenses);
      
      // Update project spent amount
      if (expense) {
        const projectExpenses = updatedExpenses.filter(e => e.projectId === expense.projectId);
        const totalSpent = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
        updateProject(expense.projectId, { spent: totalSpent });
      }
      
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete expense');
      throw error;
    }
  };

  // Utility functions
  const getProjectById = (id) => projects.find(p => p.id === id);
  
  const getProjectExpenses = (projectId) => 
    expenses.filter(e => e.projectId === projectId);

  const getProjectStats = (projectId) => {
    const project = getProjectById(projectId);
    if (!project) return null;

    const projectExpenses = getProjectExpenses(projectId);
    const totalSpent = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = project.budget - totalSpent;
    const percentUsed = (totalSpent / project.budget) * 100;

    return {
      ...project,
      totalSpent,
      remaining,
      percentUsed,
      expenseCount: projectExpenses.length
    };
  };

  const value = {
    projects,
    expenses,
    loading,
    selectedProject,
    setSelectedProject,
    addProject,
    updateProject,
    deleteProject,
    addExpense,
    updateExpense,
    deleteExpense,
    getProjectById,
    getProjectExpenses,
    getProjectStats
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
