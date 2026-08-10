import { Notification } from '../models/notification.model';
import { AppError } from '../utils/appError';

export class NotificationService {
  static async getNotifications(recipientId: string, scope: 'user' | 'admin' = 'user') {
    let filter: any = {};

    if (scope === 'admin') {
      // Store-wide operational alerts for admin dashboard
      filter = {
        $or: [
          { recipient: { $exists: false } },
          { recipient: null },
          { type: { $in: ['NewOrder', 'StockAlert', 'UserActivity'] } }
        ]
      };
    } else {
      // User personal scope: ONLY return notifications where recipient strictly matches this user's ID
      filter = { recipient: recipientId };
    }

    return Notification.find(filter).sort({ createdAt: -1 }).limit(100);
  }

  static async markAsRead(id: string, userId: string, isAdmin: boolean) {
    const filter: any = { _id: id };
    if (!isAdmin) {
      filter.recipient = userId;
    }

    const notification = await Notification.findOneAndUpdate(
      filter,
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new AppError('Notification not found or unauthorized', 404);
    return notification;
  }

  static async markAllAsRead(recipientId: string, scope: 'user' | 'admin' = 'user') {
    let filter: any = {};

    if (scope === 'admin') {
      filter = {
        $or: [
          { recipient: { $exists: false } },
          { recipient: null },
          { type: { $in: ['NewOrder', 'StockAlert', 'UserActivity'] } }
        ]
      };
    } else {
      filter = { recipient: recipientId };
    }

    await Notification.updateMany(filter, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  static async deleteNotification(id: string, userId: string, isAdmin: boolean) {
    const filter: any = { _id: id };
    if (!isAdmin) {
      filter.recipient = userId;
    }

    const notification = await Notification.findOneAndDelete(filter);
    if (!notification) throw new AppError('Notification not found or unauthorized', 404);
    return { message: 'Notification deleted successfully' };
  }
}
