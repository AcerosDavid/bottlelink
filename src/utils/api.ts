const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export const api = {
  // Links
  getLinks: (limit?: number, offset?: number) => 
    apiRequest(`/links?limit=${limit || ''}&offset=${offset || ''}`),
  
  getLink: (id: number) => 
    apiRequest(`/links/${id}`),
  
  createLink: (data: { url: string; check_frequency?: number }) => 
    apiRequest('/links', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateLink: (id: number, data: any) => 
    apiRequest(`/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteLink: (id: number) => 
    apiRequest(`/links/${id}`, {
      method: 'DELETE',
    }),
  
  checkLink: (id: number) => 
    apiRequest(`/links/${id}/check`, {
      method: 'POST',
    }),
  
  getLinkHistory: (id: number, limit?: number) => 
    apiRequest(`/links/${id}/history?limit=${limit || ''}`),
  
  getLinkEvents: (id: number, limit?: number) => 
    apiRequest(`/links/${id}/events?limit=${limit || ''}`),
  
  getLinksByStatus: (status: string) => 
    apiRequest(`/links/status/${status}`),
  
  getLinksByProvider: (providerId: number) => 
    apiRequest(`/links/provider/${providerId}`),
  
  // Providers
  getProviders: () => 
    apiRequest('/providers'),
  
  getProvider: (id: number) => 
    apiRequest(`/providers/${id}`),
  
  createProvider: (data: any) => 
    apiRequest('/providers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateProvider: (id: number, data: any) => 
    apiRequest(`/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteProvider: (id: number) => 
    apiRequest(`/providers/${id}`, {
      method: 'DELETE',
    }),
  
  // Statistics
  getOverallStatistics: () => 
    apiRequest('/statistics/overall'),
  
  getProviderStatistics: () => 
    apiRequest('/statistics/providers'),
  
  getLinkStatistics: (id: number) => 
    apiRequest(`/statistics/links/${id}`),
  
  getRecentActivity: (limit?: number) => 
    apiRequest(`/statistics/activity?limit=${limit || ''}`),
  
  getStatusDistribution: () => 
    apiRequest('/statistics/distribution/status'),
  
  getFileTypeDistribution: () => 
    apiRequest('/statistics/distribution/filetypes'),
  
  getTimeBasedStats: (hours?: number) => 
    apiRequest(`/statistics/timebased?hours=${hours || ''}`),
  
  // Health
  health: () => 
    apiRequest('/health'),
};
