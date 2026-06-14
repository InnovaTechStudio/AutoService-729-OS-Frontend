import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../infrastructure/auth.service';
import { AuthState } from '../../application/auth.state';
import { LanguageSwitcher } from '../../../../shared/presentation/language-switcher/language-switcher';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private authState = inject(AuthState);
  private translate = inject(TranslateService);

  isRegister = false;

  form = {
    workshopName: '',
    email: '',
    password: '',
  };

  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.errorMessage = '';
    this.form = { workshopName: '', email: '', password: '' };
  }

  handleSubmit(): void {
    if (!this.form.email || !this.form.password) return;

    if (this.isRegister && !this.form.workshopName) return;

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isRegister) {
      this.authService
        .registerWorkshop(this.form.workshopName, this.form.email, this.form.password)
        .subscribe({
          next: () => {
            this.authService.login(this.form.email, this.form.password).subscribe({
              next: () => {
                this.isLoading = false;
                this.router.navigate(['/']);
              },
              error: () => this.handleError(),
            });
          },
          error: () => this.handleError('auth.registerError'),
        });
    } else {
      this.authService.login(this.form.email, this.form.password).subscribe({
        next: () => {
          this.isLoading = false;
          if (this.authState.userRole() === 'mechanic') {
            this.router.navigate(['/mechanic/workspace']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: () => this.handleError('auth.loginError'),
      });
    }
  }

  private handleError(i18nKey: string = 'auth.loginError'): void {
    this.isLoading = false;
    this.errorMessage = this.translate.instant(i18nKey);
  }
}
