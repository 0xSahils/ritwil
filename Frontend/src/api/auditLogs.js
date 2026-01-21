import { apiRequest } from './client';

export const getAuditLogs = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`/audit-logs?${query}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch audit logs");
  }
  return response.json();
};
