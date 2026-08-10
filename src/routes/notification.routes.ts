import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller';

const router = Router();

router.use(protect); // All notification endpoints require logging in

router.route('/')
  .get(getNotifications)
  .patch(markAllAsRead);

router.route('/:id')
  .patch(markAsRead)
  .delete(deleteNotification);

export default router;
