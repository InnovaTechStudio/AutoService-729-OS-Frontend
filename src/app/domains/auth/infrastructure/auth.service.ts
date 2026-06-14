import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../domain/auth.entity';
import { AuthState } from '../application/auth.state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authState = inject(AuthState);
  private readonly API_URL = `${environment.apiUrl}/api/v1/auth`;

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/sign-in`, { email, password }).pipe(
      tap((response) => {
        const user = {
          id: response.id,
          email: response.email,
          role: response.role,
          workshopId: response.workshopId,
          mechanicId: response.mechanicId,
          name: response.name,
        };
        this.authState.setSession(user, response.token);
      }),
    );
  }

  registerWorkshop(workshopName: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register-workshop`, {
      workshopName,
      email,
      password,
    });
  }

  logout(): void {
    this.authState.clearSession();
    this.router.navigate(['/login']);
  }
}
