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
 *
 * @config
 *
 *
 *
 */
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router'; // Añade withDebugTracing
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { workshopInterceptor } from './shared/infrastructure/interceptors/workshop.interceptor';
import { provideTranslateService } from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
export const appConfig: ApplicationConfig = {
  providers: [

    // Routing with debug tracing (useful in development)
    provideRouter(routes, withDebugTracing()),

    // HTTP client with custom interceptor
    provideHttpClient(withInterceptors([workshopInterceptor])),

    // Animations of Angular Material
    provideAnimationsAsync(),

    provideTranslateService({
      loader: provideTranslateHttpLoader({prefix: './i18n/', suffix: '.json'}),
      fallbackLang: 'en'
    })
  ]
};
