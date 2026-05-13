/**
 * AdminLayoutComponent
 *
 * Main layout for all pages in the admin panel.
 * It contains the navigation sidebar, the top toolbar,
 * the language switcher and the main router outlet.
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
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
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

  /**
   * Updates the sidebar behavior depending on the current screen width.
   */
  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  /**
   * Closes the sidebar automatically on mobile devices after selecting an option.
   *
   * @param drawer Angular Material sidebar instance.
   */
  closeSidebarIfMobile(drawer: MatSidenav): void {
    if (this.isMobile) {
      drawer.close();
    }
  }

  /**
   * Changes the current application language.
   *
   * @param lang Language code. It can be English or Spanish.
   */
  switchLanguage(lang: 'en' | 'es'): void {
    this.translateService.switchLanguage(lang);
  }

  /**
   * Returns the current logged user name.
   */
  get userName(): string {
    return this.authService.currentUser?.name || 'Administrator';
  }

  /**
   * Logs out the current user.
   */
  logout(): void {
    this.authService.logout();
  }
}