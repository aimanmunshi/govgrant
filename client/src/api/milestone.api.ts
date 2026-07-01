import axiosInstance from './axiosInstance';
import { Milestone } from '../types';

export const getMilestonesApi = async (proposalId: number) => {
  const response = await axiosInstance.get(`/proposals/${proposalId}/milestones`);
  return response.data.data as Milestone[];
};

export const createMilestoneApi = async (
  proposalId: number,
  data: {
    title: string;
    description?: string;
    dueDate: string;
    fundRelease: number;
  }
) => {
  const response = await axiosInstance.post(`/proposals/${proposalId}/milestones`, data);
  return response.data.data as Milestone;
};

export const updateMilestoneStatusApi = async (
  milestoneId: number,
  status: string
) => {
  const response = await axiosInstance.patch(`/milestones/${milestoneId}`, { status });
  return response.data.data as Milestone;
};