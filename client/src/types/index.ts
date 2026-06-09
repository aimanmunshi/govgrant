export type Role = 'ADMIN' | 'REVIEWER' | 'APPLICANT';

export type ProposalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'FUNDED';

export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  organization?: string;
  createdAt: string;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  trlLevel: number;
  fundingAmount: number;
  status: ProposalStatus;
  domain: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  applicantId: number;
  applicant?: {
    id: number;
    name: string;
    email: string;
    organization?: string;
  };
  milestones?: Milestone[];
  reviews?: Review[];
  _count?: {
    milestones: number;
    reviews: number;
  };
}

export interface Milestone {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  status: MilestoneStatus;
  fundRelease: number;
  createdAt: string;
  proposalId: number;
}

export interface Review {
  id: number;
  score: number;
  comments: string;
  createdAt: string;
  proposalId: number;
  reviewerId: number;
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  createdAt: string;
  userId: number;
  proposalId?: number;
  user?: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
  proposal?: {
    id: number;
    title: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

export interface PaginatedResponse<T> {
  proposals: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}