import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ExpenseCategory = 'COMIDA' | 'TRANSPORTE' | 'SERVICIOS' | 'ENTRETENIMIENTO' | 'SALUD' | 'OTROS';

export interface ExpenseSummary {
  FIJO: number;
  VARIABLE: number;
  EXTRA: number;
}

export interface CreateExpenseDto {
  type: 'FIJO' | 'VARIABLE' | 'EXTRA';
  category?: ExpenseCategory;
  amount: number;
  description?: string;
}

export interface ExpenseRecord {
  id: string;
  type: 'FIJO' | 'VARIABLE' | 'EXTRA';
  category: ExpenseCategory;
  grossAmount: number;
  tax: number;
  netAmount: number;
  description: string | null;
  date: string;
}

const NO_CACHE_HEADERS = new HttpHeaders({
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
});

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expense`;

  constructor(private http: HttpClient) {}

  create(data: CreateExpenseDto): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getSummary(): Observable<ExpenseSummary> {
    return this.http.get<ExpenseSummary>(`${this.apiUrl}/summary`, { headers: NO_CACHE_HEADERS });
  }

  list(): Observable<ExpenseRecord[]> {
    return this.http.get<ExpenseRecord[]>(this.apiUrl, { headers: NO_CACHE_HEADERS });
  }
}