import axiosInstance from './axiosInstance';
import { User } from '../types';

export const registerApi = async (data: {
  name: string;
  email: string;
  password: string;
  organization?: string;
  role?: string;
}) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

export const loginApi = async (data: {
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};

export const logoutApi = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

export const refreshApi = async () => {
  const response = await axiosInstance.post('/auth/refresh');
  return response.data;
};