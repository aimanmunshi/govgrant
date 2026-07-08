import axiosInstance from './axiosInstance';
import type { Notification } from '@/types';

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getNotificationsApi = async (
  page: number = 1,
  limit: number = 20
): Promise<NotificationsResponse> => {
  const response = await axiosInstance.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const markNotificationReadApi = async (id: number): Promise<Notification> => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data.data;
};

export const markAllNotificationsReadApi = async (): Promise<void> => {
  await axiosInstance.patch(`/notifications/read-all`);
};
