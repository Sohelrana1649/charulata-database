import { Request, Response, NextFunction } from 'express';

/**
 * 15-minute IP restriction removed.
 * Pass-through middleware so requests, authentication, and leads are never blocked by IP detection.
 */
export const apiLimiter = (_req: Request, _res: Response, next: NextFunction) => next();
export const authLimiter = (_req: Request, _res: Response, next: NextFunction) => next();
export const leadLimiter = (_req: Request, _res: Response, next: NextFunction) => next();
