import { prisma } from '../../config/database.config';
import { CreateIncomeDto } from './income.dto';

const VARIABLE_DEDUCTION_RATE = 0.05;

export class IncomeService {
  async create(userId: string, data: CreateIncomeDto) {
    const gross = data.amount;
    const deduction = data.type === 'VARIABLE' ? gross * VARIABLE_DEDUCTION_RATE : 0;
    const net = gross - deduction;

    return prisma.income.create({
      data: {
        userId,
        type: data.type,
        grossAmount: gross,
        deduction,
        netAmount: net,
        description: data.description,
      },
    });
  }

async getSummary(userId: string) {
  const incomes = await prisma.income.findMany({ where: { userId } });
  const expenses = await prisma.expense.findMany({ where: { userId } });

  const summary = { FIJO: 0, VARIABLE: 0, EXTRA: 0 };
  for (const income of incomes) {
    summary[income.type] += Number(income.netAmount);
  }
  for (const expense of expenses) {
    summary[expense.type] -= Number(expense.netAmount);
  }

  return summary;
}

  async list(userId: string) {
    return prisma.income.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });
  }
}