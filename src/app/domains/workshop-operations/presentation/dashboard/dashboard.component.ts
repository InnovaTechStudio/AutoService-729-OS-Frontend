/**
 * DashboardComponent
 *
 * Main component of the workshop's administrative dashboard.
 * Displays an executive summary with:
 * - Key statistics (vehicles in workshop, active orders, pending tasks)
 * - Quick view of active vehicles
 * - Recent orders
 * - Most frequent services
 * - Simple weekly income charts
 *
 * @component
 * @selector app-dashboard
 * @standalone true
 */
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { WorkOrderStore } from '../../application/work-order.store';
import { TaskStore } from '../../application/task.store';
import { Vehicle } from '../../../fleet-management/domain/models/vehicle.model';
import { WorkOrder } from '../../domain/models/work-order.model';
import { TranslatePipe } from '@ngx-translate/core';

interface DashboardVehiclePreview {
  id: string;
  name: string;
  status: string;
  progress: number;
  image: string;
}

interface FrequentService {
  name: string;
  count: number;
  amount: number;
  progress: number;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly workOrderStore = inject(WorkOrderStore);
  private readonly taskStore = inject(TaskStore);

  protected readonly fallbackVehicleImages = [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop',
  ];

  // Signals directos de los stores
  protected readonly vehicles = this.vehicleStore.vehicles;
  protected readonly workOrders = this.workOrderStore.workOrders;
  protected readonly tasks = this.taskStore.tasks;

  protected readonly vehiclesInWorkshop = computed(
    () => this.vehicles().filter((vehicle) => vehicle.status !== 'Entregado').length,
  );

  protected readonly activeOrders = computed(
    () => this.workOrders().filter((order) => order.status === 'En Proceso').length,
  );

  protected readonly completedOrders = computed(
    () => this.workOrders().filter((order) => order.status === 'Finalizado').length,
  );

  protected readonly pendingTasks = computed(
    () => this.tasks().filter((task) => task.status === 'Pendiente').length,
  );

  protected readonly projectedIncome = computed(() =>
    this.workOrders().reduce((total, order) => total + Number(order.price || 0), 0),
  );

  protected readonly activeVehiclePreview = computed<DashboardVehiclePreview[]>(() => {
    const sourceVehicles = this.vehicles().length ? this.vehicles() : this.getFallbackVehicles();

    return sourceVehicles
      .filter((vehicle) => vehicle.status !== 'Entregado')
      .slice(0, 4)
      .map((vehicle, index) => ({
        id: String(vehicle.id ?? index),
        name: `${vehicle.brand} ${vehicle.model}`,
        status: this.getReadableVehicleStatus(vehicle.status),
        progress: this.getProgressByStatus(vehicle.status),
        image: this.fallbackVehicleImages[index % this.fallbackVehicleImages.length],
      }));
  });

  protected readonly recentOrders = computed(() => [...this.workOrders()].reverse().slice(0, 5));

  protected readonly frequentServices: FrequentService[] = [
    {
      name: 'Cambio de aceite',
      count: 12,
      amount: 540,
      progress: 86,
      icon: 'settings',
    },
    {
      name: 'Reparación de frenos',
      count: 8,
      amount: 820,
      progress: 68,
      icon: 'build',
    },
    {
      name: 'Rotación de neumáticos',
      count: 5,
      amount: 140,
      progress: 44,
      icon: 'sync',
    },
  ];

  protected readonly weeklyIncomeBars = [
    { day: 'Lun', value: 380 },
    { day: 'Mar', value: 520 },
    { day: 'Mié', value: 460 },
    { day: 'Jue', value: 610 },
    { day: 'Vie', value: 900 },
    { day: 'Sáb', value: 300 },
  ];

  ngOnInit(): void {
    this.vehicleStore.loadVehicles();
    this.workOrderStore.loadWorkOrders();
    this.taskStore.loadAllTasks();
  }
  // MMethods for navigation
  protected goToVehicles(): void {
    this.router.navigate(['/admin/vehicles']);
  }

  protected goToOrders(): void {
    this.router.navigate(['/admin/work-orders']);
  }
  // Auxiliary formatting methods
  protected goToCreateOrder(): void {
    this.router.navigate(['/admin/work-orders/new']);
  }

  protected getProgressWidth(value: number): string {
    return `${Math.min(Math.max(value, 0), 100)}%`;
  }

  protected getBarHeight(value: number): string {
    const maxValue = Math.max(...this.weeklyIncomeBars.map((item) => item.value));
    const height = maxValue > 0 ? (value / maxValue) * 120 : 0;
    return `${height}px`;
  }

  protected getStatusClass(status: string): string {
    const normalized = status.toLowerCase();

    if (normalized.includes('completado') || normalized.includes('listo')) {
      return 'status-success';
    }

    if (normalized.includes('proceso') || normalized.includes('taller')) {
      return 'status-info';
    }

    if (normalized.includes('pendiente')) {
      return 'status-warning';
    }

    return 'status-secondary';
  }

  private getProgressByStatus(status: string): number {
    if (status === 'Listo') return 100;
    if (status === 'En Taller') return 65;
    if (status === 'Entregado') return 100;
    return 10;
  }

  private getReadableVehicleStatus(status: string): string {
    if (status === 'En Taller') return 'En proceso';
    if (status === 'Listo') return 'Completado';
    if (status === 'Entregado') return 'Entregado';
    return 'Pendiente';
  }

  private getFallbackVehicles(): Vehicle[] {
    return [
      {
        id: '1',
        plate: 'ABC123',
        brand: 'Audi',
        model: 'A4 Premium',
        year: '2024',
        color: 'Negro',
        status: 'En Taller',
        customerId: '1',
      },
      {
        id: '2',
        plate: 'XYZ789',
        brand: 'BMW',
        model: 'X5',
        year: '2023',
        color: 'Azul',
        status: 'En Taller',
        customerId: '2',
      },
      {
        id: '3',
        plate: 'DEF456',
        brand: 'Tesla',
        model: 'Model 3',
        year: '2024',
        color: 'Gris',
        status: 'Listo',
        customerId: '3',
      },
    ];
  }
}
