import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { config } from '../config';

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    messageKey: err.messageKey || undefined,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
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
