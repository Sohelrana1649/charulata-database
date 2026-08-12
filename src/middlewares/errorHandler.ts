import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { config } from '../config';

const formatCleanErrorMessage = (msg: any): string => {
  if (typeof msg !== 'string') return msg || 'An error occurred';
  if (msg.trim().startsWith('[') || msg.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(msg);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const list = parsed
          .map((item: any) => {
            if (item?.message) {
              const field = Array.isArray(item?.path)
                ? item.path.filter((p: any) => p !== 'body' && p !== 'query' && p !== 'params').join('.')
                : '';
              return field ? `${field.charAt(0).toUpperCase() + field.slice(1)}: ${item.message}` : item.message;
            }
            return null;
          })
          .filter(Boolean);
        if (list.length > 0) return list.join('. ');
      }
    } catch {
      // not json
    }
  }
  return msg;
};

const sendErrorDev = (err: any, res: Response) => {
  const cleanMsg = formatCleanErrorMessage(err.message);
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: cleanMsg,
    messageKey: err.messageKey || undefined,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  const cleanMsg = formatCleanErrorMessage(err.message);
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: cleanMsg,
      messageKey: err.messageKey || undefined,
      errors: err.errors || undefined,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      messageKey: 'errors.serverError',
    });
  }
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    // MongoDB Cast Error (Invalid ID)
    if (error.name === 'CastError') {
      error = new AppError(`Invalid ${error.path}: ${error.value}.`, 400);
    }

    // MongoDB Duplicate Key Error
    if (error.code === 11000) {
      const value = Object.keys(error.keyValue)[0];
      error = new AppError(
        `Duplicate field value: "${value}". Please use another value!`,
        400
      );
    }

    // Mongoose Validation Error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((el: any) => el.message);
      error = new AppError(`Invalid input data. ${messages.join('. ')}`, 400);
    }

    // JWT Errors
    if (error.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token. Please log in again!', 401);
    }
    if (error.name === 'TokenExpiredError') {
      error = new AppError('Your token has expired! Please log in again.', 401);
    }

    sendErrorProd(error, res);
  }
};
