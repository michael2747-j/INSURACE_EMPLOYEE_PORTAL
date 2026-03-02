const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const api = {
  // Accounts
  getAccounts: async (params?: Record<string, any>) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/accounts${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  },

  getAccountDetail: async (accountId: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`);
    if (!response.ok) throw new Error('Failed to fetch account details');
    return response.json();
  },

  // Policies
  getPolicies: async (params?: Record<string, any>) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/policies${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch policies');
    return response.json();
  },

  getPolicyDetail: async (policyId: string) => {
    const response = await fetch(`${API_BASE_URL}/policies/${policyId}`);
    if (!response.ok) throw new Error('Failed to fetch policy details');
    return response.json();
  },

  // Claims
  getClaims: async (params?: Record<string, any>) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/claims${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch claims');
    return response.json();
  },

  getClaimDetail: async (claimId: string) => {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}`);
    if (!response.ok) throw new Error('Failed to fetch claim details');
    return response.json();
  },

  // Reports
  getPremiumByAccount: async (limit: number = 20) => {
    const response = await fetch(`${API_BASE_URL}/reports/premium-by-account?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch premium report');
    return response.json();
  },

  getOpenClaimsBySeverity: async () => {
    const response = await fetch(`${API_BASE_URL}/reports/open-claims-by-severity`);
    if (!response.ok) throw new Error('Failed to fetch claims by severity');
    return response.json();
  },

  getPoliciesExpiringSoon: async (days: number = 90) => {
    const response = await fetch(`${API_BASE_URL}/reports/policies-expiring-soon?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch expiring policies');
    return response.json();
  },
};

export { API_BASE_URL };