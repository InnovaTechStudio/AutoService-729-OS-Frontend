// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // <--- Importa "App" desde el archivo "app"

bootstrapApplication(App, appConfig) // <--- Pasa "App" aquí
  .catch((err) => console.error(err));
