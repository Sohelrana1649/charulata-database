import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { NotificationService } from '../services/notification.service';
import { catchAsync } from '../utils/catchAsync';

const ADMIN_ROLES = ['super_admin', 'admin', 'staff'];

export const getNotifications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const scope = req.query.scope as string | undefined;
  const isAdminRole = ADMIN_ROLES.includes(user.role);

  // Only allow admin scope if user has an admin/staff role AND explicitly requests scope=admin
  const isRequestedAdminScope = scope === 'admin' && isAdminRole;

  const notifications = await NotificationService.getNotifications(
    user._id.toString(),
    isRequestedAdminScope ? 'admin' : 'user'
  );

  res.status(200).json({
    status: 'success',
    data: { notifications }
  });
});

export const markAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const isAdminRole = ADMIN_ROLES.includes(user.role);

  const notification = await NotificationService.markAsRead(id as string, user._id.toString(), isAdminRole);
  res.status(200).json({
    status: 'success',
    data: { notification }
  });
});

export const markAllAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const scope = req.query.scope as string | undefined;
  const isAdminRole = ADMIN_ROLES.includes(user.role);

  const isRequestedAdminScope = scope === 'admin' && isAdminRole;

  const result = await NotificationService.markAllAsRead(
    user._id.toString(),
    isRequestedAdminScope ? 'admin' : 'user'
  );

  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const deleteNotification = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const isAdminRole = ADMIN_ROLES.includes(user.role);

  const result = await NotificationService.deleteNotification(id as string, user._id.toString(), isAdminRole);
  res.status(200).json({
    status: 'success',
    data: result
  });
});
