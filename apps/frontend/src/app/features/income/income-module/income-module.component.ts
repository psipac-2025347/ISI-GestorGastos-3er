import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IncomeService, IncomeSummary } from '../../../core/services/income.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { FinanceSummaryComponent } from '../../../shared/finance-summary/finance-summary.component';
import { FinanceMovementsComponent } from '../../../shared/finance-movements/finance-movements.component';
import {
  mapIncomeRecordsToMovimientos,
  mapExpenseRecordsToMovimientos,
  combineMovimientos,
  Movimiento,
} from '../../../shared/movement.util';
import { EXPENSE_CATEGORIES } from '../expense-category';

type IncomeType = 'FIJO' | 'VARIABLE' | 'EXTRA';

@Component({
  selector: 'app-income-module',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FinanceSummaryComponent, FinanceMovementsComponent],
  templateUrl: './income-module.component.html',
  styleUrls: ['./income-module.component.css'],
})
export class IncomeModuleComponent implements OnInit {
  @Input({ required: true }) type!: IncomeType;
  @Input({ required: true }) title!: string;

  categories = EXPENSE_CATEGORIES;

  saldo = signal(0);
  sueldoFijo = signal(0);
  sueldoVariable = signal(0);
  ingresosExtra = signal(0);
  movimientos = signal<Movimiento[]>([]);

  showForm = false;
  formMode: 'ingreso' | 'gasto' = 'ingreso';
  
  // CORREGIDO: Convertidos a signal para que la vista se actualice en Zoneless
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  incomeForm: FormGroup;
  expenseForm: FormGroup;

  constructor(
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private fb: FormBuilder
  ) {
    this.incomeForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]],
    });
    this.expenseForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      category: ['OTROS'],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.incomeService.getSummary().subscribe({
      next: (summary: IncomeSummary) => {
        this.sueldoFijo.set(summary.FIJO);
        this.sueldoVariable.set(summary.VARIABLE);
        this.ingresosExtra.set(summary.EXTRA);
        this.saldo.set(summary[this.type]);
      },
    });

    this.incomeService.list().subscribe({
      next: (incomeRecords) => {
        this.expenseService.list().subscribe({
          next: (expenseRecords) => {
            const income = mapIncomeRecordsToMovimientos(incomeRecords).filter((m) => m.modulo === this.type);
            const expense = mapExpenseRecordsToMovimientos(expenseRecords).filter((m) => m.modulo === this.type);
            this.movimientos.set(combineMovimientos(income, expense));
          },
          error: () => {
            const income = mapIncomeRecordsToMovimientos(incomeRecords).filter((m) => m.modulo === this.type);
            this.movimientos.set(income);
          }
        });
      },
    });
  }

  openIngresoForm(): void {
    this.formMode = 'ingreso';
    this.showForm = true;
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  openGastoForm(): void {
    this.formMode = 'gasto';
    this.showForm = true;
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  closeForm(): void {
    this.showForm = false;
    this.errorMessage.set(null);
  }

  onSubmitIncome(): void {
    if (!this.incomeForm.value.description || this.incomeForm.value.description.trim() === '') {
      this.errorMessage.set('Descripción obligatoria de llenar');
      return;
    }
    if (this.incomeForm.invalid) {
      this.incomeForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    const { amount, description } = this.incomeForm.value;
    
    this.incomeService.create({ type: this.type, amount, description }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Ingreso registrado correctamente');
        this.incomeForm.reset();
        this.showForm = false;
        this.reload();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al registrar el ingreso');
      },
    });
  }

  onSubmitExpense(): void {
    if (!this.expenseForm.value.description || this.expenseForm.value.description.trim() === '') {
      this.errorMessage.set('Descripción obligatoria de llenar');
      return;
    }
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    const { amount, category, description } = this.expenseForm.value;
    
    this.expenseService.create({ type: this.type, amount, category, description }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Gasto registrado correctamente');
        this.expenseForm.reset({ category: 'OTROS' });
        this.showForm = false;
        this.reload();
      },
      error: (err) => {
        this.loading.set(false);
        // Aquí se captura "Saldo insuficiente en este modulo"
        this.errorMessage.set(err.error?.message || 'Error al registrar el gasto');
      },
    });
  }
}