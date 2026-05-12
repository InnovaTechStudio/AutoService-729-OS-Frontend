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
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
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
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent implements OnInit {

  private authService = inject(AuthService);

  /** Indicates if the app is currently on a mobile screen */
  isMobile = false;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  /**
   * Closes the sidebar automatically on mobile devices.
   * 
   * @param drawer - Reference to the sidenav component
   */
  closeSidebarIfMobile(drawer: MatSidenav) {
    if (this.isMobile) {
      drawer.close();
    }
  }

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