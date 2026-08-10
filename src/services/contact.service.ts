import { Contact } from '../models/contact.model';
import { AppError } from '../utils/appError';

export class ContactService {
  static async createMessage(data: { name: string; email: string; message: string }) {
    return Contact.create(data);
  }

  static async getAllMessages() {
    return Contact.find().sort({ createdAt: -1 });
  }

  static async markAsRead(id: string) {
    const contact = await Contact.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!contact) {
      throw new AppError('Contact message not found', 404);
    }
    return contact;
  }

  static async deleteMessage(id: string) {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      throw new AppError('Contact message not found', 404);
    }
    return contact;
  }
}
