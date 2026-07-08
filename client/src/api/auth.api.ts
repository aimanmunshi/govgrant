import axiosInstance from './axiosInstance';
import { User } from '../types';

export const registerApi = async (data: {
  name: string;
  email: string;
  password: string;
  organization?: string;
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

export const updateProfileApi = async (data: {
  name: string;
  organization?: string;
}): Promise<User> => {
  const response = await axiosInstance.patch('/auth/me', data);
  return response.data.data;
};

export const verifyEmailApi = async (token: string) => {
  const response = await axiosInstance.post('/auth/verify-email', { token });
  return response.data;
};

export const resendVerificationApi = async () => {
  const response = await axiosInstance.post('/auth/resend-verification');
  return response.data;
};

export const forgotPasswordApi = async (email: string) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (token: string, password: string) => {
  const response = await axiosInstance.post('/auth/reset-password', { token, password });
  return response.data;
};