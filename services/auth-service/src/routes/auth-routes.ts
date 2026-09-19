import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { authController } from '../controllers/auth-controller';

const asyncHandler = (handler: RequestHandler): RequestHandler => (request: Request, response: Response, next: NextFunction) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

export const authRouter = Router();
authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/logout', asyncHandler(authController.logout));
