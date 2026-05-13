/**
 * LoginComponent
 *
 * Authentication component for the AutoService admin panel.
 * It allows users to log in using email and password, handles
 * loading states, displays translated error messages and redirects
 * the user after a successful login.
 *
 * @component
 * @selector app-login
 * @standalone true
 */
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../infrastructure/auth.service';
import { AppTranslateService } from '../../../../shared/application/services/translate.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private router = inject(Router);
  private authService = inject(AuthService);

  protected translateService = inject(AppTranslateService);

  /**
   * User email used in the login form.
   */
  email = 'admin@autoservice.com';

  /**
   * User password used in the login form.
   */
  password = 'admin';

  /**
   * Controls whether the password is hidden or visible.
   */
  hidePassword = true;

  /**
   * Indicates whether the login request is being processed.
   */
  isLoading = false;

  /**
   * Translation key used to display login error messages.
   */
  errorMessageKey = '';

  /**
   * Changes the current application language.
   *
   * @param lang Language code. It can be English or Spanish.
   */
  switchLanguage(lang: 'en' | 'es'): void {
    this.translateService.switchLanguage(lang);
  }

  /**
   * Handles the user authentication process.
   *
   * Validates the login fields, calls the authentication service
   * and redirects the user to the dashboard when the login is successful.
   */
  handleLogin(): void {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessageKey = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;

        if (success) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessageKey = 'LOGIN.INVALID_CREDENTIALS';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessageKey = 'LOGIN.SERVER_ERROR';
      }
    });
  }
}