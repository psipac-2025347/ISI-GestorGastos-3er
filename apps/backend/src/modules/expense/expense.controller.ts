import { Response, NextFunction } from 'express';
import { ExpenseService } from './expense.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

const expenseService = new ExpenseService();

export class ExpenseController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.create(req.user!.sub, req.body);
      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  }

  async summary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await expenseService.getSummary(req.user!.sub);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expenses = await expenseService.list(req.user!.sub);
      res.status(200).json(expenses);
    } catch (error) {
      next(error);
    }
  }
}