// src/app/app.ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html', // Verifica que el archivo sea app.html
  styleUrl: './app.css'
})
export class App { // <--- El nombre aquí debe ser "App"
  protected readonly title = signal('autoservice-front');
}
