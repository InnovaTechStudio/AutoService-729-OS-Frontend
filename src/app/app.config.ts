/**
 *
 *
 *
 * Main configuration of the Angular application.
 *
 * Define the global providers:
 * - Routing with debug tracing
 * - HTTP client with workshop interceptor
 * - Animations
 * - Internationalization with ngx-translate (default: English)
 *
 * @config
 *
 *
 *
 */
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { workshopInterceptor } from './shared/infrastructure/interceptors/workshop.interceptor';

// ngx-translate
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Routing with debug tracing (useful in development)
    provideRouter(routes, withDebugTracing()),

    // HTTP client with custom interceptor
    provideHttpClient(withInterceptors([workshopInterceptor])),

    // Animations of Angular Material
    provideAnimationsAsync(),

    // === ngx-translate Configuration ===
    provideTranslateService({
      fallbackLang: 'en'        // Nueva forma recomendada
    }),

    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    })
  ]
};