/**
 *
 * Login component for mechanical workshops.
 *
 * Allows users (workshops) to authenticate in the system
 * using email and password. Includes handling of loading states,
 * error messages, and redirection after successful login.
 *
 * @component
 * @selector app-login
 * @standalone true
 *
 */

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../infrastructure/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/language-switcher/language-switcher';

@Component({
  selector: 'app-login',
  standalone: true,
  /**
   * We import the Angular Material modules that we will use in the HTML
   */

  imports: [FormsModule, MatInputModule, MatButtonModule, MatIconModule, TranslatePipe, LanguageSwitcher],

  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  /**
   * User email (default value for testing purposes)
   */
  email = '';

  /**
   * User password (default value for testing purposes)
   */
  password = '';

  /**
   * Controls the visibility of the password in the input field
   */
  hidePassword = true;

  /**
   * Indicates if the login is being processed
   */
  isLoading = false;

  /**
   * Error message displayed to the user in case of login failure
   */
  errorMessage = '';

  /**
   * Demo mechanic credentials.
   * This is only used to simulate the mechanic flow without changing
   * the current db.json authentication used by the administrator.
   */
  private readonly mechanicDemoEmail = 'mechanic@autoservice.com';
  private readonly mechanicDemoPassword = 'mechanic';

  /**
   *
   * Manages the user authentication process.
   *
<<<<<<< HEAD
   * Validates that the fields are not empty, calls the authentication service
   * and manages the redirection or error messages based on the result.
   *
   */



  handleLogin(): void {

    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    const normalizedEmail = this.email.trim().toLowerCase();
    const normalizedPassword = this.password.trim();

    /**
<<<<<<< HEAD
     * In Angular we use RxJS (subscribe) instead of async/await for HTTP requests
=======
     * Temporary mechanic access.
     * It does not modify the existing administrator login flow.
     */
    if (
      normalizedEmail === this.mechanicDemoEmail &&
      normalizedPassword === this.mechanicDemoPassword
    ) {
      const mechanicSession = {
        id: 'M-1',
        name: 'Mecánico de Turno',
        email: normalizedEmail,
        role: 'Mecanico',
        workshopId: 'WS-1'
      };

      // 2. Guardamos TODO bajo la clave 'user' que es la que lee el AuthGuard
      localStorage.setItem('user', JSON.stringify(mechanicSession));

      this.isLoading = false;
      this.router.navigate(['/mechanic/workspace']);
      return;
    }

    /**
     * Current authentication flow.
     * Keep this for admin and other users working with db.json.
>>>>>>> origin/develop
     */
    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {

          /**
           * Adjust the route according to your app.routes.ts
           */
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = 'Credenciales incorrectas';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error al conectar con el servidor';
      },
    });
  }
}
