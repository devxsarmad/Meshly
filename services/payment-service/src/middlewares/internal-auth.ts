import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

export const requireInternalService = (request: Request, response: Response, next: NextFunction): void => {
  if (request.header('x-internal-service-key') !== env.internalServiceKey) {
    response.status(401).json({ success: false, message: 'Internal service authentication required' });
    return;
  }
  next();
};
