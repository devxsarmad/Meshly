import { NextFunction, Request, Response } from 'express';

export const errorHandler = (error: Error, _request: Request, response: Response, _next: NextFunction): void => {
  console.error(error);
  response.status(500).json({ success: false, message: 'Internal server error', error: 'Unexpected error' });
};
