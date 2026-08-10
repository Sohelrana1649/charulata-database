import { Subscriber } from '../models/subscriber.model';
import { AppError } from '../utils/appError';
import { sendEmail } from '../utils/email';

export class SubscriberService {
  static async subscribe(email: string) {
    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      throw new AppError('Email is already subscribed to Charulata Maison', 400);
    }
    return Subscriber.create({ email });
  }

  static async getAllSubscribers() {
    return Subscriber.find().sort({ createdAt: -1 });
  }

  static async unsubscribe(email: string) {
    const subscriber = await Subscriber.findOneAndDelete({ email });
    if (!subscriber) {
      throw new AppError('Subscriber not found', 404);
    }
    return subscriber;
  }

  static async sendBulkPromotion(subject: string, messageHtml: string) {
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) return { sentCount: 0 };
    
    const emails = subscribers.map(s => s.email);
    
    // Process sending emails in the background so we don't block the API response
    (async () => {
      for (const email of emails) {
        await sendEmail({
          email,
          subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #b0842e; font-family: Georgia, serif; font-size: 28px; margin: 0;">Charulata</h2>
                <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: 5px; margin-bottom: 0;">Luxury Handlooms & Lifestyles</p>
              </div>
              <div style="color: #0f172a; font-size: 14px; line-height: 1.6; min-height: 150px; padding: 10px 0;">
                ${messageHtml.replace(/\n/g, '<br/>')}
              </div>
              <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #64748b;">
                <p style="margin: 0;">You received this email because you subscribed to Charulata Maison updates.</p>
                <p style="margin: 5px 0 0 0;">Gulshan-2, Dhaka 1212, Bangladesh</p>
              </div>
            </div>
          `
        });
      }
    })();
    
    return { sentCount: subscribers.length };
  }
}
