import { z } from 'zod';

export const createExpenseSchema = z.object({
type: z.enum(['FIJO', 'VARIABLE', 'EXTRA']),
category: z.enum(['COMIDA', 'TRANSPORTE', 'SERVICIOS', 'ENTRETENIMIENTO', 'SALUD', 'OTROS']).optional(),
amount: z.number().positive('El monto debe ser mayor a 0'),
description: z.string().optional(),
});