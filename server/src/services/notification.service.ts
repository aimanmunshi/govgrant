import { prisma } from '../config/db';
import { NotificationType } from '@prisma/client';
import { io } from '../index';

export const createNotification = async (
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) => {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message, link },
  });

  io.to(`user:${userId}`).emit('notification:new', notification);

  return notification;
};

export const getNotifications = async (
  userId: number,
  page: number = 1,
  limit: number = 20
) => {
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const markNotificationRead = async (id: number, userId: number) => {
  const notification = await prisma.notification.findUnique({ where: { id } });

  if (!notification) throw new Error('Notification not found');
  if (notification.userId !== userId)
    throw new Error('You are not authorized to update this notification');

  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export const markAllNotificationsRead = async (userId: number) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
