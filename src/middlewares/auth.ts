import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/user.model';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { IUser } from '../types/user.types';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (!currentUser.active) {
    return next(new AppError('This user account has been deactivated.', 403));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated.', 401));
    }
    
    const roleHierarchy: Record<string, number> = {
      super_admin: 4,
      admin: 3,
      staff: 2,
      customer: 1
    };

    const userRank = roleHierarchy[req.user.role] || 1;
    const requiredRanks = roles.map(role => roleHierarchy[role] || 1);
    const minRequiredRank = Math.min(...requiredRanks);

    if (userRank >= minRequiredRank) {
      return next();
    }
    
    return next(new AppError('You do not have permission to perform this action', 403));
  };
};

export const optionalProtect = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      const currentUser = await User.findById(decoded.id);
      if (currentUser && currentUser.active) {
        req.user = currentUser;
      }
    } catch (err) {
      // Fail silently for optional authentication
    }
  }
  next();
});
