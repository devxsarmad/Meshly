import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction): void => {
  const status = error instanceof AppError ? error.statusCode : error instanceof ZodError ? 400 : 500;
  const message = error instanceof Error ? error.message : 'Unexpected error';
  if (status === 500) console.error(error);
  response.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : message, error: message });
};
