// Central API URL configuration for Cloudflare Pages (Monolithic)
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/api${cleanEndpoint}`;
};

export const API_BASE_URL = '/api';
