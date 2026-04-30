import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error: ${message}`, {
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Distinguish between operational errors and programming errors
  if (err.isOperational) {
    return res.status(statusCode).json({
      error: message,
      statusCode,
      timestamp: new Date().toISOString()
    });
  }

  // Programming or unknown error
  return res.status(500).json({
    error: 'Something went wrong. Please try again later.',
    statusCode: 500,
    timestamp: new Date().toISOString()
  });
};

// Utility to create operational errors
export class OperationalError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean = true;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, OperationalError.prototype);
  }
}
