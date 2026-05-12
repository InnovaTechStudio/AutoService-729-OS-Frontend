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
import { CommonModule } from '@angular/common';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// ngx-translate
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../../domains/auth/infrastructure/auth.service';
import { AppTranslateService } from '../../../shared/application/services/translate.service';

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
    CommonModule,
    TranslateModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent implements OnInit {

  private authService = inject(AuthService);
  protected translateService = inject(AppTranslateService);

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

  /**
   * Cambia el idioma de la aplicación
   */
  switchLanguage(lang: 'en' | 'es'): void {
    this.translateService.switchLanguage(lang);
  }

  get userName(): string {
    return this.authService.currentUser?.name || 'Administrator';
  }

  logout() {
    this.authService.logout();
  }
}