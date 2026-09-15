import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/user.model';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private apiUrl = `${environment.apiUrl}/auth/google`;

  constructor(private http: HttpClient) {}

  initialize(callback: (idToken: string) => void): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => callback(response.credential),
    });
  }

  renderButton(elementId: string): void {
    google.accounts.id.renderButton(
      document.getElementById(elementId),
      { theme: 'outline', size: 'large', width: '100%' }
    );
  }

  exchangeToken(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, { idToken });
  }
}