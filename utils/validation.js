// utils/validation.js
export const validateScorecard = (item) => {
    const errors = [];
    
    if (!item.scorecard_name) {
      errors.push('Scorecard name is required');
    }
    
    if (isNaN(item.goal) || item.goal === 0) {
      errors.push('Valid goal is required');
    }
    
    if (isNaN(item.actual)) {
      errors.push('Valid actual value is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: {
        scorecard_name: item.scorecard_name || 'Unnamed Scorecard',
        goal: parseFloat(item.goal) || 0,
        actual: parseFloat(item.actual) || 0,
        owner: item.owner || 'Unassigned',
        metric_type: ['higher_better', 'lower_better'].includes(item.metric_type) 
          ? item.metric_type 
          : 'higher_better',
        date: item.date ? new Date(item.date) : new Date()
      }
    };
  };
  
  export const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return !isNaN(start) && !isNaN(end) && start <= end;
  };