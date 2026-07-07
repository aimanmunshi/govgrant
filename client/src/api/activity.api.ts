import axiosInstance from './axiosInstance';
import type { ActivityLog } from '@/types';

export const getActivityApi = async (limit: number = 20): Promise<ActivityLog[]> => {
  const response = await axiosInstance.get(`/activity?limit=${limit}`);
  return response.data.data;
};
