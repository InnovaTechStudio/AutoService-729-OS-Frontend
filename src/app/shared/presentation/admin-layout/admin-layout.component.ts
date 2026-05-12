/**
 * AdminLayoutComponent
 * 
 * Main layout for all pages in the admin panel.
 * Contains the navigation sidebar, top toolbar and general structure
 * of the application.
 * 
 * @component
 * @selector app-admin-layout
 * @standalone true
 */
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../domains/auth/infrastructure/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  /**
   * Name of the currently authenticated user (workshop).
   */
  get userName(): string {
    return this.authService.currentUser?.name || 'Administrador';
  }

  /**
   * Close the current session and redirect to the login.
   */
  logout() {
    this.authService.logout();
  }
}
