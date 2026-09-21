import { z } from 'zod';

export const createFundMovementSchema = z
  .object({
    movementType: z.enum(['APORTE', 'RETIRO', 'GASTO_DIRECTO']),
    sourceType: z.enum(['FIJO', 'VARIABLE', 'EXTRA']).optional(),
    amount: z.number().positive('El monto debe ser mayor a 0'),
    description: z.string().min(1, 'La descripción es obligatoria'),
  })
  .refine(
    (data) => data.movementType === 'GASTO_DIRECTO' || !!data.sourceType,
    { message: 'sourceType es requerido para APORTE y RETIRO', path: ['sourceType'] }
  );