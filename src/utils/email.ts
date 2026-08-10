import { Resend } from 'resend';
import { config } from '../config';

const resend = new Resend(config.resendApiKey || process.env.RESEND_API_KEY);

export const sendEmail = async (options: { email: string; subject: string; html: string; text?: string }) => {
  const isResendConfigured = Boolean(config.resendApiKey || process.env.RESEND_API_KEY);

  if (!isResendConfigured) {
    console.log('\n==================================================');
    console.log('[EMAIL SERVICE - FALLBACK LOG]');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('--- Content ---');
    console.log(options.text || options.html);
    console.log('==================================================\n');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: config.emailFrom || 'Charulata Lifestyle <noreply@charulatalifestyle.com>',
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      throw new Error(error.message || 'Resend email sending failed');
    }

    console.log(`[EMAIL SERVICE] Email sent successfully to ${options.email}${data?.id ? ` (ID: ${data.id})` : ''}`);
  } catch (error) {
    console.error(`[EMAIL SERVICE] Failed to send email to ${options.email}:`, error);
    // Log fallback in case of delivery failure so development/testing is not blocked
    console.log('\n==================================================');
    console.log('[EMAIL SERVICE - ERROR FALLBACK LOG]');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('--- Content ---');
    console.log(options.text || options.html);
    console.log('==================================================\n');
  }
};
