// Local storage service for data persistence
const STORAGE_KEYS = {
  USER: 'budget_manager_user',
  PROJECTS: 'budget_manager_projects',
  EXPENSES: 'budget_manager_expenses',
  SETTINGS: 'budget_manager_settings'
};

export const storageService = {
  // User methods
  getUser: () => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error reading user from storage:', error);
      return null;
    }
  },

  setUser: (user) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  },

  clearUser: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing user from storage:', error);
    }
  },

  // Projects methods
  getProjects: () => {
    try {
      const projects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return projects ? JSON.parse(projects) : [];
    } catch (error) {
      console.error('Error reading projects from storage:', error);
      return [];
    }
  },

  setProjects: (projects) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects to storage:', error);
    }
  },

  // Expenses methods
  getExpenses: () => {
    try {
      const expenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return expenses ? JSON.parse(expenses) : [];
    } catch (error) {
      console.error('Error reading expenses from storage:', error);
      return [];
    }
  },

  setExpenses: (expenses) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to storage:', error);
    }
  },

  // Settings methods
  getSettings: () => {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Error reading settings from storage:', error);
      return {};
    }
  },

  setSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to storage:', error);
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Export data
  exportData: () => {
    return {
      projects: storageService.getProjects(),
      expenses: storageService.getExpenses(),
      settings: storageService.getSettings(),
      exportedAt: new Date().toISOString()
    };
  },

  // Import data
  importData: (data) => {
    try {
      if (data.projects) storageService.setProjects(data.projects);
      if (data.expenses) storageService.setExpenses(data.expenses);
      if (data.settings) storageService.setSettings(data.settings);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};
