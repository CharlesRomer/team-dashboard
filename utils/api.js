// utils/api.js
const DEFAULT_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export class ApiError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const handleApiResponse = async (response) => {
  let errorData = {};
  let errorMessage = `HTTP error! status: ${response.status}`;

  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        errorData = data;
        errorMessage = data.error || errorMessage;
      }
      return data;
    } else {
      throw new Error('Invalid content type received');
    }
  } catch (error) {
    throw new ApiError(
      errorMessage,
      response.status,
      { originalError: error.message, ...errorData }
    );
  }
};

export const fetchWithRetry = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  
  const finalOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: controller.signal,
  };

  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, finalOptions);
      clearTimeout(timeoutId);
      
      // Check if the response is ok before processing it
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }
      
      return await handleApiResponse(response);
    } catch (error) {
      lastError = error;

      // Don't retry if we've hit our limit or if it's a user abort
      if (attempt === MAX_RETRIES - 1 || error.name === 'AbortError') {
        throw error;
      }

      // Exponential backoff
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      console.warn(`API call failed, retrying in ${delay}ms...`, error);
      await wait(delay);
    }
  }

  throw lastError;
};

export const createApiEndpoint = (path, options = {}) => {
  return async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${path}${queryString ? `?${queryString}` : ''}`;
    
    try {
      return await fetchWithRetry(url, options);
    } catch (error) {
      console.error('API call failed:', {
        path,
        params,
        error: error.message,
        details: error.details
      });
      throw error;
    }
  };
};