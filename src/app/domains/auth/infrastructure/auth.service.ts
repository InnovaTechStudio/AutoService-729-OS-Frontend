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
      );
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  get currentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
