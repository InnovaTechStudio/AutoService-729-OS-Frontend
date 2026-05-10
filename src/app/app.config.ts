import { ApplicationConfig } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router'; // Añade withDebugTracing
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { workshopInterceptor } from './shared/infrastructure/interceptors/workshop.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Activa el tracing aquí 👇
    provideRouter(routes, withDebugTracing()),
    provideHttpClient(withInterceptors([workshopInterceptor])),
    provideAnimationsAsync()
  ]
};
