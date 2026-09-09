export interface CreateExpenseDto {
type: 'FIJO' | 'VARIABLE' | 'EXTRA';
category?: 'COMIDA' | 'TRANSPORTE' | 'SERVICIOS' | 'ENTRETENIMIENTO' | 'SALUD' | 'OTROS';
amount: number;
description?: string;
}