import { sendEmail } from '../utils/email';
import { config } from '../config';

async function testEmail() {
  console.log('[TEST EMAIL] Initiating email test...');
  console.log(`[TEST EMAIL] Configured Resend Key: ${config.resendApiKey ? 'Present' : '(None)'}`);
  
  await sendEmail({
    email: 'charulatalifestyl@gmail.com',
    subject: 'OTP Verification Test - Charulata Lifestyle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #c99a3c; text-align: center;">CHARULATA LIFESTYLE</h2>
        <p>Hello,</p>
        <p>This is a test email sent to verify the Resend connection. Your test OTP is:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #c99a3c; background-color: #fcf8f2; padding: 10px 25px; border-radius: 5px; border: 1px dashed #c99a3c;">889900</span>
        </div>
        <p>If you received this email, it means your Resend email service is configured and working perfectly!</p>
      </div>
    `,
    text: 'Charulata Lifestyle Test OTP is 889900'
  });
  
  console.log('[TEST EMAIL] Test completed.');
}

testEmail().catch(err => {
  console.error('[TEST EMAIL] Error running test script:', err);
});
