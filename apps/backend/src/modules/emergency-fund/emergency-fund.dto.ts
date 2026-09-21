export type FundMovementType = 'APORTE' | 'RETIRO' | 'GASTO_DIRECTO';
export type SourceType = 'FIJO' | 'VARIABLE' | 'EXTRA';

export interface CreateFundMovementDto {
  movementType: FundMovementType;
  sourceType?: SourceType;
  amount: number;
  description?: string;
}