import { IncomeRecord } from '../core/services/income.service';
import { ExpenseRecord } from '../core/services/expense.service';

export interface Movimiento {
  descripcion: string;
  fecha: string;
  fechaSort: number; // Agregado: timestamp para ordenamiento cronológico preciso
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
    descripcion: r.description || TYPE_LABELS[r.type] || r.type,
    fecha: formatFecha(r.date),
    fechaSort: new Date(r.date).getTime(), // Guardamos el timestamp real
    monto: Number(r.netAmount),
    tipo: 'ingreso' as const,
    modulo: r.type,
    bruto: Number(r.grossAmount),
    ajuste: Number(r.deduction),
    ajusteLabel: r.deduction > 0 ? 'Descuento (5% IGSS/ISR)' : 'Sin descuento',
  }));
}

export function mapExpenseRecordsToMovimientos(records: ExpenseRecord[]): Movimiento[] {
  return records.map((r) => ({
    descripcion: r.description || r.category,
    fecha: formatFecha(r.date),
    fechaSort: new Date(r.date).getTime(), // Guardamos el timestamp real
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
    // Orden descendente: el timestamp más grande (más reciente) va primero
    return b.fechaSort - a.fechaSort;
  });
}

// Alias retrocompatible
export const mapRecordsToMovimientos = mapIncomeRecordsToMovimientos;