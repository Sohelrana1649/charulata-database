import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';
import { User } from '../models/user.model';
import { AppError } from '../utils/appError';
import { sendEmail } from '../utils/email';

// Helper to generate JWT Token
export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any
  });
};

// Helper to generate a secure cryptographically random 6-digit numeric OTP
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export class AuthService {
  static async register(userData: any) {
    let email = userData.email;
    let phone = userData.phone;

    // Handle single 'identifier' input (Email or Bangladeshi Phone)
    if (userData.identifier && typeof userData.identifier === 'string') {
      const cleanId = userData.identifier.trim();
      if (cleanId.includes('@')) {
        email = cleanId.toLowerCase();
      } else {
        // E.164 Bangladeshi phone normalization
        let rawPhone = cleanId.replace(/[\s\-\(\)]/g, '');
        if (rawPhone.startsWith('+88')) {
          rawPhone = rawPhone.substring(3);
        } else if (rawPhone.startsWith('88')) {
          rawPhone = rawPhone.substring(2);
        }

        const bdPhoneRegex = /^01[3-9]\d{8}$/;
        if (!bdPhoneRegex.test(rawPhone)) {
          throw new AppError('Invalid Bangladeshi phone number', 400, 'errors.invalidPhone');
        }
        phone = `+88${rawPhone}`;
      }
    }

    /**
     * Guest-to-Registered User Upgrade Logic:
     * ----------------------------------------
     * When a user registers with a phone or email:
     * 1. If an existing user is found AND isGuest === true (they ordered as a guest before):
     *    -> UPGRADE this user! Set their password, set isGuest to false.
     *    -> Update name/email/phone if provided.
     *    -> All past guest order history is automatically preserved under their new account!
     * 2. If an existing user is found AND isGuest === false (already registered):
     *    -> Return 409 Conflict error ("Phone/email already registered").
     * 3. If no existing user:
     *    -> Create a new registered user.
     */
    let existingUser: any = null;
    if (phone) {
      existingUser = await User.findOne({ phone }).select('+password');
    }
    if (!existingUser && email) {
      existingUser = await User.findOne({ email }).select('+password');
    }

    if (existingUser) {
      if (existingUser.isGuest) {
        // Upgrade guest user to full registered account
        existingUser.password = userData.password;
        existingUser.isGuest = false;
        existingUser.isVerified = true;
        if (userData.name) existingUser.name = userData.name;
        if (email && !existingUser.email) existingUser.email = email;
        if (phone && !existingUser.phone) existingUser.phone = phone;

        await existingUser.save();

        const token = generateToken(existingUser._id.toString());
        const userJson = existingUser.toJSON();
        delete userJson.password;
        delete userJson.otp;

        return {
          token,
          user: userJson,
          message: 'Guest account successfully upgraded to registered account',
          messageKey: 'errors.registerSuccess'
        };
      } else {
        if (email && existingUser.email === email) {
          throw new AppError('Email already registered, please login', 409, 'errors.duplicateEmail');
        }
        throw new AppError('Phone number already registered, please login', 409, 'errors.duplicatePhone');
      }
    }

    // Prepare create object for new user
    const userPayload: any = {
      name: userData.name,
      password: userData.password,
      isGuest: false,
      isVerified: true,
      role: userData.role || 'customer',
    };
    if (email) userPayload.email = email;
    if (phone) userPayload.phone = phone;

    const newUser = await User.create(userPayload);

    const token = generateToken(newUser._id.toString());
    const userJson = newUser.toJSON();
    delete userJson.password;
    delete userJson.otp;

    return {
      token,
      user: userJson,
      message: 'Registration successful',
      messageKey: 'errors.registerSuccess'
    };
  }

  static async verifyOtp(email: string, otp: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.otp || !user.otp.code) {
      throw new AppError('No OTP request found. Please request a new OTP.', 400);
    }

    if (user.otp.code !== otp) {
      throw new AppError('Invalid OTP code', 400);
    }

    if (new Date() > user.otp.expiresAt) {
      throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    // Verify user and invalidate OTP immediately to prevent replay attacks
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id.toString());
    const userJson = user.toJSON();
    delete userJson.password;

    return {
      token,
      user: userJson
    };
  }

  static async login(loginData: any) {
    const { email, phone, identifier, password } = loginData;
    const inputIdentifier = identifier || email || phone;

    if (!inputIdentifier || typeof inputIdentifier !== 'string') {
      throw new AppError('Phone or email required', 400, 'errors.identifierRequired');
    }

    const cleanId = inputIdentifier.trim();
    let query: any = {};

    if (cleanId.includes('@')) {
      query = { email: cleanId.toLowerCase() };
    } else {
      let rawPhone = cleanId.replace(/[\s\-\(\)]/g, '');
      if (rawPhone.startsWith('+88')) {
        rawPhone = rawPhone.substring(3);
      } else if (rawPhone.startsWith('88')) {
        rawPhone = rawPhone.substring(2);
      }

      const e164 = `+88${rawPhone}`;
      const noLeadingZero = rawPhone.startsWith('0') ? rawPhone.substring(1) : rawPhone;

      query = {
        $or: [
          { phone: cleanId },
          { phone: e164 },
          { phone: rawPhone },
          { phone: `88${rawPhone}` },
          { phone: noLeadingZero },
          { phone: `+880${noLeadingZero}` }
        ]
      };
    }

    // Debug: Log the query being used
    console.log('=== LOGIN DEBUG ===');
    console.log('Input identifier:', cleanId);
    console.log('Query:', JSON.stringify(query));

    // Check if user exists
    const user = await User.findOne(query).select('+password');
    console.log('User found:', user ? `Yes (${user.email || user.phone})` : 'No');
    console.log('=== END LOGIN DEBUG ===');
    
    if (!user) {
      throw new AppError('এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে নিবন্ধন করুন।', 401, 'errors.accountNotFound');
    }

    // Protect Guest accounts that have no registered password yet
    if (user.isGuest || !user.password) {
      throw new AppError('এই নম্বরে কোনো নিবন্ধিত অ্যাকাউন্ট নেই। অর্ডার ট্র্যাকিং করার জন্য আগে পাসওয়ার্ড সেট করুন অথবা অ্যাকাউন্ট রেজিস্টার করুন।', 401, 'errors.guestNeedsRegistration');
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new AppError('পাসওয়ার্ড ভুল হয়েছে। পুনরায় চেষ্টা করুন।', 401, 'errors.wrongPassword');
    }

    if (!user.active) {
      throw new AppError('Account deactivated', 403, 'errors.accountDeactivated');
    }

    const token = generateToken(user._id.toString());
    const userJson = user.toJSON();
    delete userJson.password;

    return {
      token,
      user: userJson
    };
  }

  static async completeProfile(data: { phone: string; password: string; name?: string; email?: string }) {
    let { phone, password, name, email } = data;

    let rawPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (rawPhone.startsWith('+88')) {
      rawPhone = rawPhone.substring(3);
    } else if (rawPhone.startsWith('88')) {
      rawPhone = rawPhone.substring(2);
    }

    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(rawPhone)) {
      throw new AppError('Invalid Bangladeshi phone number', 400, 'errors.invalidPhone');
    }

    const normalizedPhone = `+88${rawPhone}`;

    const user = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { phone: rawPhone },
        { phone: `88${rawPhone}` }
      ]
    }).select('+password');

    if (!user) {
      throw new AppError('এই নম্বরে কোনো অর্ডার বা গেস্ট প্রোফাইল পাওয়া যায়নি। দয়া করে নতুন করে রেজিস্টার করুন।', 404, 'errors.userNotFound');
    }

    if (!user.isGuest && user.password) {
      throw new AppError('এই নম্বরটি ইতিমধ্যে নিবন্ধিত রয়েছে। দয়া করে সরাসরি লগইন করুন।', 409, 'errors.alreadyRegistered');
    }

    user.password = password;
    user.isGuest = false;
    user.isVerified = true;
    user.isPhoneVerified = true;
    if (name && name.trim()) user.name = name.trim();
    if (email && email.trim() && !user.email) user.email = email.trim().toLowerCase();

    await user.save();

    const token = generateToken(user._id.toString());
    const userJson = user.toJSON();
    delete userJson.password;
    delete userJson.otp;

    return {
      token,
      user: userJson,
      message: 'Account successfully upgraded and password set!',
      messageKey: 'errors.profileCompleted'
    };
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No user found with that email address.', 404);
    }

    const otpCode = generateOtp();
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000)
    };
    await user.save();

    // Send password reset email
    await sendEmail({
      email: user.email,
      subject: 'Reset Your Password - Charulata Lifestyle',
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #c99a3c; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">CHARULATA</h2>
            <p style="color: #666666; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Lifestyle</p>
          </div>
          <div style="border-top: 3px solid #d9534f; padding-top: 20px;">
            <h3 style="color: #d9534f; margin-top: 0;">Password Reset Request</h3>
            <p style="color: #555555; line-height: 1.6;">We received a request to reset your password. Please use the following 6-digit One-Time Password (OTP) to complete the reset process:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; font-size: 36px; font-weight: 800; color: #d9534f; background-color: #fdf5f5; border: 1px dashed #d9534f; padding: 10px 30px; letter-spacing: 5px; border-radius: 6px;">${otpCode}</span>
            </div>
            <p style="color: #777777; font-size: 13px; line-height: 1.6;">Note: This OTP is valid for <b>${config.otpExpiryMinutes} minutes</b>. If you did not request a password reset, please ignore this email.</p>
          </div>
          <div style="margin-top: 35px; border-top: 1px solid #eeeeee; padding-top: 15px; text-align: center; color: #999999; font-size: 12px;">
            <p style="margin: 0;">&copy; 2026 Charulata Lifestyle. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">Dhaka, Bangladesh | Cash On Delivery Platform</p>
          </div>
        </div>
      `,
      text: `You requested a password reset. Your reset OTP code is ${otpCode}. It is valid for ${config.otpExpiryMinutes} minutes.`
    });

    return {
      message: 'Password reset OTP sent to email.'
    };
  }

  static async resetPassword(resetData: any) {
    const { email, otp, password } = resetData;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.otp || user.otp.code !== otp || new Date() > user.otp.expiresAt) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    user.password = password;
    user.otp = undefined;
    user.isVerified = true; // verification by proxy
    await user.save();

    return {
      message: 'Password reset successful! You can now log in.'
    };
  }

  static async googleLogin(idToken: string) {
    if (!idToken) {
      throw new AppError('Google token is required', 400);
    }

    const googleClientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
    let payload: any = null;

    // 1. If token is JWT ID token (3 segments separated by '.'), verify with OAuth2Client
    if (idToken.split('.').length === 3) {
      try {
        const client = new OAuth2Client(googleClientId);
        const ticket = await client.verifyIdToken({
          idToken,
          audience: googleClientId,
        });
        payload = ticket.getPayload();
      } catch (err: any) {
        console.warn('[GOOGLE ID_TOKEN VERIFY WARNING]', err?.message);
      }
    }

    // 2. If payload not obtained (e.g. access_token from useGoogleLogin), fetch userinfo from Google API
    if (!payload) {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          payload = await res.json();
        }
      } catch (err: any) {
        console.error('[GOOGLE USERINFO FETCH ERROR]', err?.message);
      }
    }

    if (!payload || !payload.email) {
      throw new AppError('Google token verification failed. Could not retrieve profile.', 400);
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || payload.email.split('@')[0];
    const profileImage = payload.picture || '';

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for Google login
      user = await User.create({
        name,
        email,
        profileImage,
        isVerified: true,
        role: 'customer',
        active: true,
      });
    } else {
      // Update verified status and profileImage if missing
      if (!user.isVerified) {
        user.isVerified = true;
      }
      if (!user.profileImage && profileImage) {
        user.profileImage = profileImage;
      }
      await user.save();
    }

    const token = generateToken(user._id.toString());
    const userObj = user.toObject();
    delete userObj.password;

    return {
      message: 'Google login successful',
      data: {
        token,
        user: userObj,
      },
    };
  }
}
