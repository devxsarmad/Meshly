import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction): void => {
  console.error(error);

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: 'Request failed',
    });
    return;
  }

  response.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'Unexpected error',
  });
};
