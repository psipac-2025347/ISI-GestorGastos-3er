import { Router } from 'express';
import { ExpenseController } from './expense.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createExpenseSchema } from './expense.validation';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const expenseController = new ExpenseController();

router.post('/', authMiddleware, validate(createExpenseSchema), expenseController.create.bind(expenseController));
router.get('/summary', authMiddleware, expenseController.summary.bind(expenseController));
router.get('/', authMiddleware, expenseController.list.bind(expenseController));

export default router;