/**
 * DashboardComponent
 *
 * Main component of the workshop administrative dashboard.
 * It displays an executive overview with key performance indicators,
 * active vehicles, recent work orders, frequent services and weekly
 * income visualization.
 *
 * The component loads data from vehicle, work order and task stores,
 * then derives dashboard metrics using Angular computed values.
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

import { TranslateModule } from '@ngx-translate/core';

import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { WorkOrderStore } from '../../application/work-order.store';
import { TaskStore } from '../../application/task.store';
import { Vehicle } from '../../../fleet-management/domain/models/vehicle.model';

/**
 * View model used to display active vehicle previews in the dashboard.
 */
interface DashboardVehiclePreview {
  id: string;
  name: string;
  status: string;
  progress: number;
  image: string;
}

/**
 * View model used to display frequent services in the dashboard.
 */
interface FrequentService {
  nameKey: string;
  count: number;
  amount: number;
  progress: number;
  icon: string;
}

/**
 * View model used to display weekly income bars.
 */
interface WeeklyIncomeBar {
  dayKey: string;
  value: number;
  highlight: boolean;
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
    TranslateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly workOrderStore = inject(WorkOrderStore);
  private readonly taskStore = inject(TaskStore);

  /**
   * Fallback images used when vehicles do not provide an image.
   */
  protected readonly fallbackVehicleImages = [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop'
  ];

  /**
   * Direct vehicle signal from the vehicle store.
   */
  protected readonly vehicles = this.vehicleStore.vehicles;

  /**
   * Direct work order signal from the work order store.
   */
  protected readonly workOrders = this.workOrderStore.workOrders;

  /**
   * Direct task signal from the task store.
   */
  protected readonly tasks = this.taskStore.tasks;

  /**
   * Number of vehicles that are still active in the workshop.
   */
  protected readonly vehiclesInWorkshop = computed(() =>
    this.vehicles().filter((vehicle) => vehicle.status !== 'Entregado').length
  );

  /**
   * Number of active work orders.
   */
  protected readonly activeOrders = computed(() =>
    this.workOrders().filter((order) => order.status === 'En Proceso').length
  );

  /**
   * Number of completed work orders.
   */
  protected readonly completedOrders = computed(() =>
    this.workOrders().filter((order) => order.status === 'Finalizado').length
  );

  /**
   * Number of pending tasks.
   */
  protected readonly pendingTasks = computed(() =>
    this.tasks().filter((task) => task.status === 'Pendiente').length
  );

  /**
   * Total projected income based on registered work orders.
   */
  protected readonly projectedIncome = computed(() =>
    this.workOrders()
      .reduce((total, order) => total + Number(order.price || 0), 0)
  );

  /**
   * Active vehicle preview list displayed in the dashboard.
   */
  protected readonly activeVehiclePreview = computed<DashboardVehiclePreview[]>(() => {
    const sourceVehicles = this.vehicles().length
      ? this.vehicles()
      : this.getFallbackVehicles();

    return sourceVehicles
      .filter((vehicle) => vehicle.status !== 'Entregado')
      .slice(0, 4)
      .map((vehicle, index) => ({
        id: String(vehicle.id ?? index),
        name: `${vehicle.brand} ${vehicle.model}`,
        status: this.getVehicleStatusTranslationKey(vehicle.status),
        progress: this.getProgressByStatus(vehicle.status),
        image: this.fallbackVehicleImages[index % this.fallbackVehicleImages.length]
      }));
  });

  /**
   * Recent work orders displayed in the dashboard.
   */
  protected readonly recentOrders = computed(() =>
    [...this.workOrders()].reverse().slice(0, 5)
  );

  /**
   * Frequent services displayed in the service performance panel.
   */
  protected readonly frequentServices: FrequentService[] = [
    {
      nameKey: 'DASHBOARD.SERVICES.OIL_CHANGE',
      count: 12,
      amount: 540,
      progress: 86,
      icon: 'settings'
    },
    {
      nameKey: 'DASHBOARD.SERVICES.BRAKE_REPAIR',
      count: 8,
      amount: 820,
      progress: 68,
      icon: 'build'
    },
    {
      nameKey: 'DASHBOARD.SERVICES.TIRE_ROTATION',
      count: 5,
      amount: 140,
      progress: 44,
      icon: 'sync'
    }
  ];

  /**
   * Weekly income values used to render the simple bar chart.
   */
  protected readonly weeklyIncomeBars: WeeklyIncomeBar[] = [
    { dayKey: 'DASHBOARD.DAYS.MON', value: 380, highlight: false },
    { dayKey: 'DASHBOARD.DAYS.TUE', value: 520, highlight: false },
    { dayKey: 'DASHBOARD.DAYS.WED', value: 460, highlight: false },
    { dayKey: 'DASHBOARD.DAYS.THU', value: 610, highlight: false },
    { dayKey: 'DASHBOARD.DAYS.FRI', value: 900, highlight: true },
    { dayKey: 'DASHBOARD.DAYS.SAT', value: 300, highlight: false }
  ];

  /**
   * Loads all data required by the dashboard.
   */
  ngOnInit(): void {
    this.vehicleStore.loadVehicles();
    this.workOrderStore.loadWorkOrders();
    this.taskStore.loadAllTasks();
  }

  /**
   * Navigates to the vehicle management page.
   */
  protected goToVehicles(): void {
    this.router.navigate(['/admin/vehicles']);
  }

  /**
   * Navigates to the work order list page.
   */
  protected goToOrders(): void {
    this.router.navigate(['/admin/work-orders']);
  }

  /**
   * Navigates to the create work order page.
   */
  protected goToCreateOrder(): void {
    this.router.navigate(['/admin/work-orders/new']);
  }

  /**
   * Returns a CSS width value for progress bars.
   *
   * @param value Progress value.
   * @returns Width percentage as a string.
   */
  protected getProgressWidth(value: number): string {
    return `${Math.min(Math.max(value, 0), 100)}%`;
  }

  /**
   * Returns the height for a weekly income bar.
   *
   * @param value Income value.
   * @returns Height in pixels.
   */
  protected getBarHeight(value: number): string {
    const maxValue = Math.max(...this.weeklyIncomeBars.map((item) => item.value));
    const height = maxValue > 0 ? (value / maxValue) * 120 : 0;

    return `${height}px`;
  }

  /**
   * Returns a CSS class based on a status value or status translation key.
   *
   * @param status Status value or translation key.
   * @returns CSS class for the status badge.
   */
  protected getStatusClass(status: string): string {
    const normalized = status.toLowerCase();

    if (
      normalized.includes('completed') ||
      normalized.includes('completado') ||
      normalized.includes('ready') ||
      normalized.includes('listo')
    ) {
      return 'status-success';
    }

    if (
      normalized.includes('progress') ||
      normalized.includes('proceso') ||
      normalized.includes('workshop') ||
      normalized.includes('taller')
    ) {
      return 'status-info';
    }

    if (
      normalized.includes('pending') ||
      normalized.includes('pendiente')
    ) {
      return 'status-warning';
    }

    return 'status-secondary';
  }

  /**
   * Returns the translation key for a work order status.
   *
   * @param status Work order status.
   * @returns Translation key for the status.
   */
  protected getOrderStatusTranslationKey(status: string): string {
    if (status === 'En Proceso') return 'DASHBOARD.STATUS.IN_PROGRESS';
    if (status === 'Finalizado') return 'DASHBOARD.STATUS.COMPLETED';
    if (status === 'Pendiente') return 'DASHBOARD.STATUS.PENDING';

    return 'DASHBOARD.STATUS.UNKNOWN';
  }

  /**
   * Returns the progress percentage according to the vehicle status.
   *
   * @param status Vehicle status.
   * @returns Progress percentage.
   */
  private getProgressByStatus(status: string): number {
    if (status === 'Listo') return 100;
    if (status === 'En Taller') return 65;
    if (status === 'Entregado') return 100;

    return 10;
  }

  /**
   * Returns the translation key for a vehicle status.
   *
   * @param status Vehicle status.
   * @returns Translation key for the status.
   */
  private getVehicleStatusTranslationKey(status: string): string {
    if (status === 'En Taller') return 'DASHBOARD.STATUS.IN_PROGRESS';
    if (status === 'Listo') return 'DASHBOARD.STATUS.COMPLETED';
    if (status === 'Entregado') return 'DASHBOARD.STATUS.DELIVERED';

    return 'DASHBOARD.STATUS.PENDING';
  }

  /**
   * Returns fallback vehicle data used when the store has no vehicles.
   *
   * @returns Fallback vehicle list.
   */
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
        customerId: '1'
      },
      {
        id: '2',
        plate: 'XYZ789',
        brand: 'BMW',
        model: 'X5',
        year: '2023',
        color: 'Azul',
        status: 'En Taller',
        customerId: '2'
      },
      {
        id: '3',
        plate: 'DEF456',
        brand: 'Tesla',
        model: 'Model 3',
        year: '2024',
        color: 'Gris',
        status: 'Listo',
        customerId: '3'
      }
    ];
  }
}