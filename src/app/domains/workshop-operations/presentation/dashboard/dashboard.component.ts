import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, CommonModule],
  template: `
    <div class="dashboard-container p-4">
      <h1 class="mat-headline-4 mb-4">Panel de Control - AutoService</h1>

      <div class="kpi-grid">
        <mat-card class="kpi-card border-blue">
          <mat-card-content class="flex-between">
            <div>
              <span class="kpi-label">Vehículos en Taller</span>
              <div class="kpi-value">12</div>
            </div>
            <div class="icon-box bg-blue"><mat-icon>directions_car</mat-icon></div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card border-orange">
          <mat-card-content class="flex-between">
            <div>
              <span class="kpi-label">Órdenes Activas</span>
              <div class="kpi-value">8</div>
            </div>
            <div class="icon-box bg-orange"><mat-icon>assignment</mat-icon></div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card border-teal">
          <mat-card-content class="flex-between">
            <div>
              <span class="kpi-label">Tareas Pendientes</span>
              <div class="kpi-value">24</div>
            </div>
            <div class="icon-box bg-teal"><mat-icon>checklist</mat-icon></div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .p-4 { padding: 2rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .kpi-card { border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .border-blue { border-left: 5px solid #3b82f6; }
    .border-orange { border-left: 5px solid #f59e0b; }
    .border-teal { border-left: 5px solid #14b8a6; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .kpi-label { color: #64748b; font-size: 0.9rem; font-weight: 500; display: block; margin-bottom: 0.5rem; }
    .kpi-value { font-size: 2rem; font-weight: bold; color: #0f172a; }
    .icon-box { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .icon-box mat-icon { color: white; }
    .bg-blue { background-color: #3b82f6; }
    .bg-orange { background-color: #f59e0b; }
    .bg-teal { background-color: #14b8a6; }
  `]
})
export class DashboardComponent {
  // Los números están en duro por ahora, luego los conectaremos con los Stores (Signals)
}
