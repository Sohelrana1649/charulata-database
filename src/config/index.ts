import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

// Force public DNS to resolve MongoDB Atlas SRV records (fixes ISP blocks)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('[CONFIG] Failed to set custom DNS servers:', e);
}

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'super-secret-charulata-key-12345!')) {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing or insecure in production mode!');
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/charulata',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-charulata-key-12345!',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
  shippingChargeInsideDhaka: parseInt(process.env.SHIPPING_CHARGE_INSIDE_DHAKA || '60', 10),
  shippingChargeOutsideDhaka: parseInt(process.env.SHIPPING_CHARGE_OUTSIDE_DHAKA || '120', 10),
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'Charulata Lifestyle <noreply@charulatalifestyle.com>',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '627933808535-12olfmjeimfmbo44mdgf4hs2g4gran7f.apps.googleusercontent.com',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'ybfk3z5b',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '413321881982569',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || 'mRiHJVHW3IHSFUHGN_6czgY3V74',
};
