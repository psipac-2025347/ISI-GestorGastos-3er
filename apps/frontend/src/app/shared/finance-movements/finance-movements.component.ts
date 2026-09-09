import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Movimiento } from '../movement.util';
import { IncomeService } from '../../core/services/income.service';
import { ExpenseService } from '../../core/services/expense.service';
import { EXPENSE_CATEGORIES } from '../../features/income/expense-category';

type ModuloFiltro = 'FIJO' | 'VARIABLE' | 'EXTRA' | null;
type TipoFiltro = 'ingreso' | 'gasto' | null;

@Component({
  selector: 'app-finance-movements',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './finance-movements.component.html',
  styleUrls: ['./finance-movements.component.css'],
})
export class FinanceMovementsComponent {
  @Input({ required: true }) movimientos: Movimiento[] = [];
  @Output() created = new EventEmitter<void>();

  categories = EXPENSE_CATEGORIES;

  showModal = signal(false);
  selectedModulo = signal<ModuloFiltro>(null);
  selectedTipo = signal<TipoFiltro>(null);

  showAddForm = signal(false);
  addModulo = signal<'FIJO' | 'VARIABLE' | 'EXTRA' | null>(null);
  addTipo = signal<'ingreso' | 'gasto' | null>(null);
  addCategory = signal<string>('OTROS');
  addAmount: number | null = null;
  addDescription = '';
  addLoading = signal(false);
  addError = signal<string | null>(null);

  detailMovimiento = signal<Movimiento | null>(null);

  constructor(
    private incomeService: IncomeService,
    private expenseService: ExpenseService
  ) {}

  get preview(): Movimiento[] {
    return this.movimientos.slice(0, 5);
  }

  get filtered(): Movimiento[] {
    return this.movimientos.filter((m) => {
      const moduloOk = !this.selectedModulo() || m.modulo === this.selectedModulo();
      const tipoOk = !this.selectedTipo() || m.tipo === this.selectedTipo();
      return moduloOk && tipoOk;
    });
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  toggleModulo(modulo: ModuloFiltro): void {
    this.selectedModulo.set(this.selectedModulo() === modulo ? null : modulo);
  }

  toggleTipo(tipo: TipoFiltro): void {
    this.selectedTipo.set(this.selectedTipo() === tipo ? null : tipo);
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    this.addError.set(null);
  }

  selectAddModulo(modulo: 'FIJO' | 'VARIABLE' | 'EXTRA'): void {
    this.addModulo.set(modulo);
  }

  selectAddTipo(tipo: 'ingreso' | 'gasto'): void {
    this.addTipo.set(tipo);
  }

  selectAddCategory(category: string): void {
    this.addCategory.set(category);
  }

  submitAdd(): void {
    if (!this.addModulo() || !this.addTipo()) {
      this.addError.set('Selecciona un modulo y un tipo');
      return;
    }
    if (!this.addAmount || this.addAmount <= 0) {
      this.addError.set('Ingresa un monto valido mayor a 0');
      return;
    }

    this.addLoading.set(true);
    this.addError.set(null);

    const request$ =
      this.addTipo() === 'gasto'
        ? this.expenseService.create({
            type: this.addModulo()!,
            category: this.addCategory() as any,
            amount: this.addAmount,
            description: this.addDescription || undefined,
          })
        : this.incomeService.create({
            type: this.addModulo()!,
            amount: this.addAmount,
            description: this.addDescription || undefined,
          });

    request$.subscribe({
      next: () => {
        this.addLoading.set(false);
        this.addAmount = null;
        this.addDescription = '';
        this.addModulo.set(null);
        this.addTipo.set(null);
        this.addCategory.set('OTROS');
        this.showAddForm.set(false);
        this.created.emit();
      },
      error: (err) => {
        this.addLoading.set(false);
        this.addError.set(err.error?.message || 'Error al registrar el movimiento');
      },
    });
  }

  showDetail(mov: Movimiento): void {
    this.detailMovimiento.set(mov);
  }

  closeDetail(): void {
    this.detailMovimiento.set(null);
  }
}