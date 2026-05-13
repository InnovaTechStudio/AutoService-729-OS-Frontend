/**
 * Main configuration of the Angular application.
 *
 * Defines the global providers:
 * - Routing
 * - HTTP client with workshop interceptor
 * - Angular Material animations
 * - Internationalization with ngx-translate
 *
 * @config
 */
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { workshopInterceptor } from './shared/infrastructure/interceptors/workshop.interceptor';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withDebugTracing()),

    provideHttpClient(withInterceptors([workshopInterceptor])),

    provideAnimationsAsync(),

    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    })
  ]
};