// utils/validation.js

// Constants for validation rules
const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MIN_GOAL_VALUE: 0,
};

// Custom validation error
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Helper functions
const isValidDate = (date) => {
  if (!date) return false;
  const parsed = new Date(date);
  return parsed instanceof Date && !isNaN(parsed);
};

const isValidNumber = (value) => {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim();
};

// Main validation functions
export const validateScorecard = (item) => {
  const errors = [];
  const sanitized = {};

  // Validate scorecard name
  sanitized.scorecard_name = sanitizeString(item.scorecard_name);
  if (!sanitized.scorecard_name) {
    errors.push({ field: 'scorecard_name', message: 'Scorecard name is required' });
  } else if (sanitized.scorecard_name.length < VALIDATION_RULES.MIN_NAME_LENGTH) {
    errors.push({ 
      field: 'scorecard_name', 
      message: `Name must be at least ${VALIDATION_RULES.MIN_NAME_LENGTH} characters` 
    });
  }

  // Validate goal
  if (!isValidNumber(item.goal)) {
    errors.push({ field: 'goal', message: 'Valid goal value is required' });
    sanitized.goal = 0;
  } else {
    sanitized.goal = Number(item.goal);
    if (sanitized.goal < VALIDATION_RULES.MIN_GOAL_VALUE) {
      errors.push({ field: 'goal', message: 'Goal must be greater than or equal to 0' });
    }
  }

  // Validate actual value
  if (!isValidNumber(item.actual)) {
    errors.push({ field: 'actual', message: 'Valid actual value is required' });
    sanitized.actual = 0;
  } else {
    sanitized.actual = Number(item.actual);
  }

  // Validate owner
  sanitized.owner = sanitizeString(item.owner) || 'Unassigned';

  // Validate metric type
  sanitized.metric_type = ['higher_better', 'lower_better'].includes(item.metric_type)
    ? item.metric_type
    : 'higher_better';

  // Validate date
  if (!isValidDate(item.date)) {
    sanitized.date = new Date();
    errors.push({ field: 'date', message: 'Invalid date format' });
  } else {
    sanitized.date = new Date(item.date);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitized
  };
};

export const validateDateRange = (startDate, endDate) => {
  const errors = [];

  if (!isValidDate(startDate)) {
    errors.push({ field: 'startDate', message: 'Invalid start date' });
  }

  if (!isValidDate(endDate)) {
    errors.push({ field: 'endDate', message: 'Invalid end date' });
  }

  if (errors.length === 0) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      errors.push({ 
        field: 'dateRange', 
        message: 'Start date must be before or equal to end date' 
      });
    }

    // Don't allow dates too far in the future
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (end > maxDate) {
      errors.push({ 
        field: 'endDate', 
        message: 'End date cannot be more than 1 year in the future' 
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    } : null
  };
};

// Helper function to validate department names
export const validateDepartment = (department) => {
  const validDepartments = ['Marketing', 'Creative', 'Sales', 'Product', 'Other'];
  const sanitized = sanitizeString(department);
  
  return {
    isValid: validDepartments.includes(sanitized),
    errors: validDepartments.includes(sanitized) ? [] : [{
      field: 'department',
      message: 'Invalid department name'
    }],
    data: sanitized
  };
};

// Export validation rules for use in other files
export const ValidationRules = VALIDATION_RULES;