import { prisma } from '../config/db';
import { Role } from '@prisma/client';

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: true,
      createdAt: true,
      _count: {
        select: {
          proposals: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateUserRole = async (userId: number, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  return await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: true,
    },
  });
};

export const getActivityLog = async (limit: number = 20) => {
  return await prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      proposal: {
        select: { id: true, title: true },
      },
    },
  });
};

export const createActivityLog = async (
  userId: number,
  action: string,
  description: string,
  proposalId?: number
) => {
  return await prisma.activityLog.create({
    data: {
      userId,
      action,
      description,
      proposalId,
    },
  });
};