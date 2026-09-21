import { z } from 'zod';

export const createIncomeSchema = z.object({
  type: z.enum(['FIJO', 'VARIABLE', 'EXTRA']),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  description: z.string().min(1, 'La descripción es obligatoria')
});