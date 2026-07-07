import axiosInstance from './axiosInstance';
import type { User } from '@/types';

export const getUsersApi = async (role?: string): Promise<User[]> => {
  const params = new URLSearchParams();
  if (role) params.append('role', role);
  const response = await axiosInstance.get(`/users?${params.toString()}`);
  return response.data.data;
};
