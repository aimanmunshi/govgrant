import axiosInstance from './axiosInstance';
import { Review } from '../types';

export const submitReviewApi = async (
  proposalId: number,
  data: { score: number; comments: string }
) => {
  const response = await axiosInstance.post(
    `/proposals/${proposalId}/reviews`,
    data
  );
  return response.data;
};

export const getReviewsApi = async (proposalId: number) => {
  const response = await axiosInstance.get(`/proposals/${proposalId}/reviews`);
  return response.data.data as {
    reviews: Review[];
    averageScore: number | null;
    totalReviews: number;
  };
};