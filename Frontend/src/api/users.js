import { apiRequest } from './client';

export const getUsers = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`/users?${query}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch users");
  }
  return response.json();
};
