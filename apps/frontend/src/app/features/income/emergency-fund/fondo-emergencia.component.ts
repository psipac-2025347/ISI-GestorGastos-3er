import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  EmergencyFundService,
  FundMovementRecord,
  SourceType,
} from '../../../core/services/emergency-fund.service';

type MovementMode = 'APORTE' | 'RETIRO' | 'GASTO_DIRECTO';
type FundMovementType = 'APORTE' | 'RETIRO' | 'GASTO_DIRECTO';

const SOURCE_LABELS: Record<string, string> = {
  FIJO: 'Sueldo Fijo',
  VARIABLE: 'Sueldo Variable',
  EXTRA: 'Ingreso Extra',
};

@Component({
  selector: 'app-fondo-emergencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fondo-emergencia.component.html',
  styleUrls: ['./fondo-emergencia.component.css'],
})
export class FondoEmergenciaComponent implements OnInit {
  balance = signal(0);
  movements = signal<FundMovementRecord[]>([]);

  showForm = false;
  mode: MovementMode = 'APORTE';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  sourceLabels = SOURCE_LABELS;

  form: FormGroup;

  constructor(private fundService: EmergencyFundService, private fb: FormBuilder) {
    this.form = this.fb.group({
      sourceType: [''],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.fundService.getBalance().subscribe({
      next: (res) => this.balance.set(res.balance),
    });
    this.fundService.list().subscribe({
      next: (records) => this.movements.set(records),
    });
  }

  openForm(mode: MovementMode): void {
    this.mode = mode;
    this.showForm = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.form.reset();
  }

  closeForm(): void {
    this.showForm = false;
  }

  get requiresSource(): boolean {
    return this.mode === 'APORTE' || this.mode === 'RETIRO';
  }

  onSubmit(): void {
    if (this.requiresSource && !this.form.value.sourceType) {
      this.errorMessage = 'Selecciona un modulo';
      return;
    }
    if (!this.form.value.description || this.form.value.description.trim() === '') {
      this.errorMessage = 'Descripción obligatoria de llenar';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    const { sourceType, amount, description } = this.form.value;

    this.fundService.create({
      movementType: this.mode,
      sourceType: this.requiresSource ? (sourceType as SourceType) : undefined,
      amount,
      description: description,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Movimiento registrado correctamente';
        this.form.reset();
        this.showForm = false;
        this.reload();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al registrar el movimiento';
      },
    });
  }

  movementLabel(type: FundMovementType): string {
    return { APORTE: 'Aporte', RETIRO: 'Retiro', GASTO_DIRECTO: 'Gasto directo' }[type];
  }

  formatFecha(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}