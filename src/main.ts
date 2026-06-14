/**
 * Main entry file for the application (Bootstrap)
 *
 * This is the starting point for the entire Angular application.
 * It is responsible for:
 * - Importing the global configuration (`appConfig`)
 * - Importing the root component (`AppComponent`)
 * - Initializing the application with `bootstrapApplication`
 *
 * @file main.ts
 * @version 1.0
 * @see {@link appConfig} - Global configuration of providers
 * @see {@link AppComponent} - Root component of the application
 */
import { bootstrapApplication } from '@angular/platform-browser';

// Global configuration of the application
import { appConfig } from './app/app.config';

// Root component
import { App } from './app/app';

/**
 * Initializes and starts the Angular application in standalone mode.
 *
 * Uses `bootstrapApplication` instead of the legacy `bootstrapModule`
 * since this project uses standalone components.
 */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
