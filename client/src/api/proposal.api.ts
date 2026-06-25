import axiosInstance from './axiosInstance';
import { Proposal, PaginatedResponse } from '../types';

export const getProposalsApi = async (filters?: {
  status?: string;
  domain?: string;
  trlLevel?: number;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.domain) params.append('domain', filters.domain);
  if (filters?.trlLevel) params.append('trlLevel', filters.trlLevel.toString());
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await axiosInstance.get(`/proposals?${params.toString()}`);
  return response.data.data as PaginatedResponse<Proposal>;
};

export const getProposalByIdApi = async (id: number) => {
  const response = await axiosInstance.get(`/proposals/${id}`);
  return response.data.data as Proposal;
};

export const createProposalApi = async (data: {
  title: string;
  description: string;
  trlLevel: number;
  fundingAmount: number;
  domain: string;
}) => {
  const response = await axiosInstance.post('/proposals', data);
  return response.data.data as Proposal;
};

export const updateProposalApi = async (id: number, data: Partial<{
  title: string;
  description: string;
  trlLevel: number;
  fundingAmount: number;
  domain: string;
}>) => {
  const response = await axiosInstance.patch(`/proposals/${id}`, data);
  return response.data.data as Proposal;
};

export const submitProposalApi = async (id: number) => {
  const response = await axiosInstance.post(`/proposals/${id}/submit`);
  return response.data.data as Proposal;
};

export const updateProposalStatusApi = async (id: number, status: string) => {
  const response = await axiosInstance.patch(`/proposals/${id}/status`, { status });
  return response.data.data as Proposal;
};

export const deleteProposalApi = async (id: number) => {
  const response = await axiosInstance.delete(`/proposals/${id}`);
  return response.data;
};