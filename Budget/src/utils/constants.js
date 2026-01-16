// Application constants

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CONTRACTOR: 'contractor',
  FIELD_EMPLOYEE: 'field_employee'
};

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const EXPENSE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const EXPENSE_TYPES = {
  CAPITAL: 'capital',
  RESOURCE: 'resource'
};

export const EXPENSE_CATEGORIES = {
  MATERIALS: 'Materials',
  LABOR: 'Labor',
  EQUIPMENT: 'Equipment',
  PERMITS: 'Permits & Licenses',
  TRANSPORTATION: 'Transportation',
  UTILITIES: 'Utilities',
  SUBCONTRACTORS: 'Subcontractors',
  SAFETY: 'Safety Equipment',
  TOOLS: 'Tools',
  OFFICE: 'Office Supplies',
  INSURANCE: 'Insurance',
  OTHER: 'Other'
};

export const PROJECT_TYPES = {
  RESIDENTIAL: 'Residential Construction',
  COMMERCIAL: 'Commercial Construction',
  INDUSTRIAL: 'Industrial Construction',
  INFRASTRUCTURE: 'Infrastructure',
  RENOVATION: 'Renovation',
  CIVIL: 'Civil Engineering',
  ELECTRICAL: 'Electrical Work',
  PLUMBING: 'Plumbing Work',
  HVAC: 'HVAC Systems',
  OTHER: 'Other'
};

export const CHART_COLORS = {
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  orange: '#f97316'
};

export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  WITH_TIME: 'MM/DD/YYYY HH:mm',
  ISO: 'YYYY-MM-DD'
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100]
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  MIN_LENGTH: (min) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max) => `Maximum ${max} characters allowed`,
  MIN_VALUE: (min) => `Minimum value is ${min}`,
  MAX_VALUE: (max) => `Maximum value is ${max}`,
  INVALID_NUMBER: 'Please enter a valid number',
  INVALID_DATE: 'Please enter a valid date',
  PASSWORD_MISMATCH: 'Passwords do not match'
};

export const APP_CONFIG = {
  APP_NAME: 'Construction Budget Manager',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@construction-budget.com',
  DOCS_URL: 'https://docs.construction-budget.com',
  CURRENCY: 'USD',
  TIMEZONE: 'America/New_York',
  DATE_FORMAT: 'MM/DD/YYYY',
  ITEMS_PER_PAGE: 10
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: ['admin', 'manager', 'contractor', 'field_employee'],
  CREATE_PROJECT: ['admin', 'manager'],
  EDIT_PROJECT: ['admin', 'manager'],
  DELETE_PROJECT: ['admin'],
  CREATE_EXPENSE: ['admin', 'manager', 'contractor', 'field_employee'],
  EDIT_EXPENSE: ['admin', 'manager', 'contractor'],
  DELETE_EXPENSE: ['admin', 'manager'],
  APPROVE_EXPENSE: ['admin', 'manager'],
  VIEW_REPORTS: ['admin', 'manager', 'contractor'],
  MANAGE_USERS: ['admin'],
  EXPORT_DATA: ['admin', 'manager']
};
