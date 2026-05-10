import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../infrastructure/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // Importamos los módulos de Angular Material que usaremos en el HTML
  imports: [FormsModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Equivalente a los ref() de Vue
  email = 'admin@autoservice.com';
  password = 'admin';
  hidePassword = true; // Para alternar la visibilidad de la contraseña
  isLoading = false;
  errorMessage = '';

  handleLogin() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    // En Angular usamos RxJS (subscribe) en lugar de async/await para las peticiones
    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/admin/dashboard']); // Ajusta la ruta según tu app.routes.ts
        } else {
          this.errorMessage = 'Credenciales incorrectas';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error al conectar con el servidor';
      }
    });
  }
}
