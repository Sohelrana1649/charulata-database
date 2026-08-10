export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
  public readonly messageKey?: string;

  constructor(message: string, statusCode: number, messageKey?: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.messageKey = messageKey;

    Error.captureStackTrace(this, this.constructor);
  }
}

