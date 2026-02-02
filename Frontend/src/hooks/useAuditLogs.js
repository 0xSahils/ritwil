import { useQuery } from '@tanstack/react-query';

const fetchAuditLogs = async (params) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key]) queryParams.append(key, params[key]);
  });

  const response = await fetch(`/api/audit-logs?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch audit logs');
  }
  return response.json();
};

export const useAuditLogs = (params) => {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => fetchAuditLogs(params),
    keepPreviousData: true,
    staleTime: 5000,
  });
};
