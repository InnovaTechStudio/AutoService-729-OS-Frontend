import { Injectable, signal, computed } from '@angular/core';
import { User } from '../domain/auth.entity';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly userSignal = signal<User | null>(this.loadUserFromStorage());
  private readonly tokenSignal = signal<string | null>(this.loadTokenFromStorage());

  readonly currentUser = this.userSignal.asReadonly();
  readonly currentToken = this.tokenSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly userRole = computed(() => this.userSignal()?.role || 'admin');
  readonly currentWorkshopId = computed(() => this.userSignal()?.workshopId || null);

  setSession(user: User, token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    this.userSignal.set(user);
    this.tokenSignal.set(token);
  }

  clearSession(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.userSignal.set(null);
    this.tokenSignal.set(null);
  }

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  private loadTokenFromStorage(): string | null {
    return localStorage.getItem('token');
  }


}
