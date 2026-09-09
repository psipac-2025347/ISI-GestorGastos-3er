import { prisma } from '../../config/database.config';
import { CreateFundMovementDto } from './emergency-fund.dto';

const IVA_RATE = 0.12;

export class EmergencyFundService {
  async create(userId: string, data: CreateFundMovementDto) {
    return prisma.$transaction(async (tx) => {
      let grossAmount = data.amount;
      let tax = 0;
      let netAmount = data.amount;

      if (data.movementType === 'APORTE' || data.movementType === 'GASTO_DIRECTO') {
        tax = grossAmount * IVA_RATE;
        netAmount = grossAmount + tax;
      }

      const movement = await tx.emergencyFundMovement.create({
        data: {
          userId,
          movementType: data.movementType,
          sourceType: data.movementType === 'GASTO_DIRECTO' ? null : data.sourceType,
          grossAmount,
          tax,
          netAmount,
          description: data.description,
        },
      });

      if (data.movementType === 'APORTE') {
        await tx.expense.create({
          data: {
            userId,
            type: data.sourceType!,
            category: 'OTROS',
            grossAmount,
            tax,
            netAmount,
            description: data.description || 'Aporte a Fondo de Emergencia',
          },
        });
      }

      if (data.movementType === 'RETIRO') {
        await tx.income.create({
          data: {
            userId,
            type: data.sourceType!,
            grossAmount,
            deduction: 0,
            netAmount: grossAmount,
            description: data.description || 'Retiro de Fondo de Emergencia',
          },
        });
      }

      return movement;
    });
  }

  async getBalance(userId: string) {
    const movements = await prisma.emergencyFundMovement.findMany({ where: { userId } });

    let balance = 0;
    for (const m of movements) {
      if (m.movementType === 'APORTE') balance += Number(m.netAmount);
      if (m.movementType === 'RETIRO') balance -= Number(m.grossAmount);
      if (m.movementType === 'GASTO_DIRECTO') balance -= Number(m.netAmount);
    }

    return { balance };
  }

  async list(userId: string) {
    return prisma.emergencyFundMovement.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });
  }
}