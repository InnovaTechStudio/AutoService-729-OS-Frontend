/**
 *
 * Authentication service for auto repair shops.
 *
 * Handles login, logout, and retrieving the current user.
 * Uses a simulated backend (json-server) to authenticate shops
 * using email and password.
 *
 * @service
 * @providedIn 'root'
 *
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = environment.apiUrl;

  /**
 *
 * Log in with workshop credentials.
 *
 * @param email - Workshop email address
 * @param password - Workshop password
 * @returns Observable that emits `true` if the login is successful, `false` otherwise.
 *
 */
  login(email: string, password: string) {
    return this.http.get<any[]>(`${this.API_URL}/workshops?email=${email}&password=${password}`)
      .pipe(
        map(workshops => {
          if (workshops.length > 0) {
            localStorage.setItem('user', JSON.stringify(workshops[0]));
            return true;
          }
          return false;
        })
        // You can add catchError if you want to handle network errors
      );
  }

  /**
 *
  * Log out of the current user session.
  *
 * Removes the user data from localStorage and redirects to the login page.
 *
 */
  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  /**
 *
 * Retrieves the current user stored in  localStorage.
 *
 * @returns The current user or `null` if there is no active session.
 *
 */
  get currentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
