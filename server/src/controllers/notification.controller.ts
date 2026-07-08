import { Request, Response } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const result = await getNotifications(req.user!.userId, page, limit);

    sendSuccess(res, result, 'Notifications fetched successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const readNotification = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const notification = await markNotificationRead(id, req.user!.userId);

    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const readAllNotifications = async (req: Request, res: Response) => {
  try {
    await markAllNotificationsRead(req.user!.userId);

    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
