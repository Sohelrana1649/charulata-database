import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { trackRegistration } from '../utils/metaPixel';

export const register = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthService.register(req.body);
  res.status(201).json({
    status: 'success',
    ...result
  });
});

export const verifyOtp = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { email, otp } = req.body;
  const result = await AuthService.verifyOtp(email, otp);

  // Fire-and-forget: Track CompleteRegistration on Meta CAPI
  trackRegistration({
    email,
    clientIpAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
    clientUserAgent: req.headers['user-agent'],
  }).catch(err => console.error('[META CAPI] registration error:', err));

  res.status(200).json({
    status: 'success',
    ...result
  });
});

export const login = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthService.login(req.body);
  res.status(200).json({
    status: 'success',
    ...result
  });
});

export const forgotPassword = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  res.status(200).json({
    status: 'success',
    ...result
  });
});

export const resetPassword = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  res.status(200).json({
    status: 'success',
    ...result
  });
});

export const getProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

export const logout = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

export const completeProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthService.completeProfile(req.body);
  res.status(200).json({
    status: 'success',
    ...result
  });
});

export const googleLogin = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { idToken, credential } = req.body;
  const tokenToVerify = idToken || credential;
  const result = await AuthService.googleLogin(tokenToVerify);
  res.status(200).json({
    status: 'success',
    ...result
  });
});
