import { prisma } from '../../config/database.config';
import { CreateExpenseDto } from './expense.dto';
import { getModuleBalance } from '../../utils/balance.util';

const IVA_RATE = 0.12;

export class ExpenseService {
  async create(userId: string, data: CreateExpenseDto) {
    const gross = data.amount;
    const tax = gross * IVA_RATE;
    const net = gross + tax;

    // Validar saldo suficiente antes de crear
    const currentBalance = await getModuleBalance(userId, data.type);
    if (currentBalance - net < 0) {
      throw { status: 400, message: 'Saldo insuficiente en este modulo' };
    }

    return prisma.expense.create({
      data: {
        userId,
        type: data.type,
        category: data.category || 'OTROS',
        grossAmount: gross,
        tax,
        netAmount: net,
        description: data.description,
      },
    });
  }

  async getSummary(userId: string) {
    const expenses = await prisma.expense.findMany({ where: { userId } });

    const summary = { FIJO: 0, VARIABLE: 0, EXTRA: 0 };
    for (const expense of expenses) {
      summary[expense.type] += Number(expense.netAmount);
    }

    return summary;
  }

  async list(userId: string) {
    return prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });
  }
}