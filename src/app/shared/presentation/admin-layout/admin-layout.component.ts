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

  isMobile = false;
  ngOnInit(): void {
    this.checkScreenSize();
  }
  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
  closeSidebarIfMobile(drawer: MatSidenav) {
    if (this.isMobile) {
      drawer.close();
    }
  }
  get userName(): string {
    return this.authService.currentUser?.name || 'Administrador';
  }
  logout() {
    this.authService.logout();
  }
}
