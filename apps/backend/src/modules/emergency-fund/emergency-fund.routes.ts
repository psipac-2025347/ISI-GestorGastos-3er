import { Router } from 'express';
import { EmergencyFundController } from './emergency-fund.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createFundMovementSchema } from './emergency-fund.validation';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const emergencyFundController = new EmergencyFundController();

router.post('/', authMiddleware, validate(createFundMovementSchema), emergencyFundController.create.bind(emergencyFundController));
router.get('/balance', authMiddleware, emergencyFundController.balance.bind(emergencyFundController));
router.get('/', authMiddleware, emergencyFundController.list.bind(emergencyFundController));

export default router;