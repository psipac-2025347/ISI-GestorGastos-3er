import { Response, NextFunction } from 'express';
import { EmergencyFundService } from './emergency-fund.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

const emergencyFundService = new EmergencyFundService();

export class EmergencyFundController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const movement = await emergencyFundService.create(req.user!.sub, req.body);
      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  }

  async balance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await emergencyFundService.getBalance(req.user!.sub);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const movements = await emergencyFundService.list(req.user!.sub);
      res.status(200).json(movements);
    } catch (error) {
      next(error);
    }
  }
}