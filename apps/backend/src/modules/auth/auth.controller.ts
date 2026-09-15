import { AuthService } from './auth.service';
import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  async me(req: AuthRequest, res: Response) {
  res.status(200).json({ user: req.user });
}
async refresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.refresh(req.user!.sub, req.user!.email, req.user!.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
async google(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body;
    const result = await authService.loginWithGoogle(idToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
}