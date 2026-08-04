// Central API URL configuration for Vercel + Render deployments
export const getApiUrl = (endpoint) => {
  const baseUrl = process.env.REACT_APP_API_URL || '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (baseUrl) {
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${cleanEndpoint}`;
  }
  
  return cleanEndpoint;
};

export const API_BASE_URL = process.env.REACT_APP_API_URL || '';
