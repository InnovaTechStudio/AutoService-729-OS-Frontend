/**
 *
 *
 * AppComponent (Componente Raíz)
 *
 * Main component and entry point of the entire application.
 * Contains only the `RouterOutlet` to render the views
 * according to the route configuration defined in `app.routes.ts`.
 *
 * @component
 * @selector app-root
 * @standalone true
 *
 *
 */
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  /**
 *
 * Verify that the file is app.html
 *
 */
  templateUrl: './app.html',
  styleUrl: './app.css'
})

/**
 *
 * Application title (used mainly for debugging)
 *
 */
export class App { 
  protected readonly title = signal('autoservice-front');
}
