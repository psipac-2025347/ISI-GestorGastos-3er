import { IncomeRecord } from '../core/services/income.service';
import { ExpenseRecord } from '../core/services/expense.service';

export interface Movimiento {
  descripcion: string;
  fecha: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  modulo: 'FIJO' | 'VARIABLE' | 'EXTRA';
  bruto: number;
  ajuste: number;
  ajusteLabel: string;
}

const TYPE_LABELS: Record<string, string> = {
  FIJO: 'Sueldo Fijo',
  VARIABLE: 'Sueldo Variable',
  EXTRA: 'Ingreso Extra',
};

function formatFecha(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-GT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function mapIncomeRecordsToMovimientos(records: IncomeRecord[]): Movimiento[] {
  return records.map((r) => ({
    descripcion: TYPE_LABELS[r.type] || r.type,
    fecha: formatFecha(r.date),
    monto: Number(r.netAmount),
    tipo: 'ingreso' as const,
    modulo: r.type,
    bruto: Number(r.grossAmount),
    ajuste: Number(r.deduction),
    ajusteLabel: 'Descuento (5% IGSS/ISR)',
  }));
}

export function mapExpenseRecordsToMovimientos(records: ExpenseRecord[]): Movimiento[] {
  return records.map((r) => ({
    descripcion: r.description || r.category,
    fecha: formatFecha(r.date),
    monto: Number(r.netAmount),
    tipo: 'gasto' as const,
    modulo: r.type,
    bruto: Number(r.grossAmount),
    ajuste: Number(r.tax),
    ajusteLabel: 'IVA (12%)',
  }));
}

export function combineMovimientos(income: Movimiento[], expense: Movimiento[]): Movimiento[] {
  return [...income, ...expense].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });
}

// Alias retrocompatible con el nombre anterior, por si algún componente aún lo usa
export const mapRecordsToMovimientos = mapIncomeRecordsToMovimientos;