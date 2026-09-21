import { prisma } from '../config/database.config';

export async function getModuleBalance(userId: string, type: 'FIJO' | 'VARIABLE' | 'EXTRA'): Promise<number> {
  const incomes = await prisma.income.findMany({ where: { userId, type } });
  const expenses = await prisma.expense.findMany({ where: { userId, type } });

  let balance = 0;
  for (const income of incomes) {
    balance += Number(income.netAmount);
  }
  for (const expense of expenses) {
    balance -= Number(expense.netAmount);
  }

  return balance;
}

export async function getFundBalance(userId: string): Promise<number> {
  const movements = await prisma.emergencyFundMovement.findMany({ where: { userId } });

  let balance = 0;
  for (const m of movements) {
    if (m.movementType === 'APORTE') balance += Number(m.netAmount);
    if (m.movementType === 'RETIRO') balance -= Number(m.grossAmount);
    if (m.movementType === 'GASTO_DIRECTO') balance -= Number(m.netAmount);
  }

  return balance;
}