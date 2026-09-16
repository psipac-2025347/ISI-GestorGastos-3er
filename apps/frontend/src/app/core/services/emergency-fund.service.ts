import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type FundMovementType = 'APORTE' | 'RETIRO' | 'GASTO_DIRECTO';
export type SourceType = 'FIJO' | 'VARIABLE' | 'EXTRA';

export interface CreateFundMovementDto {
  movementType: FundMovementType;
  sourceType?: SourceType;
  amount: number;
  description?: string;
}

export interface FundMovementRecord {
  id: string;
  movementType: FundMovementType;
  sourceType: SourceType | null;
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
export class EmergencyFundService {
  private apiUrl = `${environment.apiUrl}/emergency-fund`;

  constructor(private http: HttpClient) {}

  create(data: CreateFundMovementDto): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/balance`, { headers: NO_CACHE_HEADERS });
  }

  list(): Observable<FundMovementRecord[]> {
    return this.http.get<FundMovementRecord[]>(this.apiUrl, { headers: NO_CACHE_HEADERS });
  }
}