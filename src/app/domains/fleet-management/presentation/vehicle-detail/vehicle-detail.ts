/**
 * VehicleDetailComponent
 *
 * Component responsible for displaying detailed information about a vehicle
 * registered in the workshop. It shows the vehicle identity, owner information,
 * current service status, work order details, technical diagnosis and associated
 * maintenance tasks.
 *
 * This component uses Angular Signals and computed values to keep the UI updated
 * automatically when vehicle, customer, work order or task data changes.
 *
 * @component
 * @selector app-vehicle-detail
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CustomerStore } from '../../../customer-management/application/customer.store';
import { Vehicle } from '../../domain/models/vehicle.model';
import { VehicleStore } from '../../application/vehicle.store';
import { TaskStore } from '../../../workshop-operations/application/task.store';
import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';
import { Task, WorkOrder } from '../../../workshop-operations/domain/models/work-order.model';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    TranslateModule
  ],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css'
})
export class VehicleDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly vehicleStore = inject(VehicleStore);
  private readonly customerStore = inject(CustomerStore);
  private readonly workOrderStore = inject(WorkOrderStore);
  private readonly taskStore = inject(TaskStore);
  private readonly translate = inject(TranslateService);

  /**
   * Vehicle ID obtained from the current route parameters.
   */
  protected readonly vehicleId = this.route.snapshot.paramMap.get('id') ?? '';

  /**
   * Current vehicle selected from the vehicle store.
   */
  protected readonly vehicle = computed<Vehicle | undefined>(() =>
    this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(this.vehicleId))
  );

  /**
   * Name of the owner assigned to the current vehicle.
   */
  protected readonly ownerName = computed(() => {
    const currentVehicle = this.vehicle();

    if (!currentVehicle) {
      return this.translate.instant('VEHICLE_DETAIL.UNASSIGNED');
    }

    const customer = this.customerStore
      .customers()
      .find((item) => String(item.id) === String(currentVehicle.customerId));

    return customer?.fullName ?? this.translate.instant('VEHICLE_DETAIL.UNASSIGNED');
  });

  /**
   * Active work order associated with the current vehicle.
   */
  protected readonly activeWorkOrder = computed<WorkOrder | undefined>(() => {
    const currentVehicle = this.vehicle();

    if (!currentVehicle) {
      return undefined;
    }

    return this.workOrderStore
      .workOrders()
      .find((order) => String(order.vehicleId) === String(currentVehicle.id));
  });

  /**
   * List of maintenance tasks associated with the active work order.
   */
  protected readonly vehicleTasks = computed<Task[]>(() => {
    const currentOrder = this.activeWorkOrder();

    if (!currentOrder) {
      return [];
    }

    return this.taskStore
      .tasks()
      .filter((task) => String(task.workOrderId) === String(currentOrder.id));
  });

  /**
   * Number of completed maintenance tasks.
   */
  protected readonly completedTasks = computed(() =>
    this.vehicleTasks().filter((task) => task.status === 'Completada').length
  );

  /**
   * Overall progress percentage based on completed tasks or vehicle status.
   */
  protected readonly progress = computed(() => {
    const tasks = this.vehicleTasks();

    if (tasks.length > 0) {
      return Math.round((this.completedTasks() / tasks.length) * 100);
    }

    const currentVehicle = this.vehicle();

    if (!currentVehicle) {
      return 0;
    }

    if (currentVehicle.status === 'Listo' || currentVehicle.status === 'Entregado') {
      return 100;
    }

    return currentVehicle.status === 'En Taller' ? 65 : 10;
  });

  /**
   * Problem reported by the customer in the active work order.
   */
  protected readonly problemReported = computed(() =>
    this.activeWorkOrder()?.description ??
    this.translate.instant('VEHICLE_DETAIL.DEFAULT_PROBLEM')
  );

  /**
   * Technical diagnosis generated according to the current work order and tasks.
   */
  protected readonly technicalDiagnosis = computed(() => {
    const order = this.activeWorkOrder();

    if (!order) {
      return this.translate.instant('VEHICLE_DETAIL.DIAGNOSIS_PENDING');
    }

    if (this.vehicleTasks().length === 0) {
      return this.translate.instant('VEHICLE_DETAIL.DIAGNOSIS_REQUIRES_TASKS');
    }

    return this.translate.instant('VEHICLE_DETAIL.DIAGNOSIS_REGISTERED');
  });

  /**
   * Loads all data required by the vehicle detail view.
   */
  ngOnInit(): void {
    this.vehicleStore.loadVehicles();
    this.customerStore.loadCustomers();
    this.workOrderStore.loadWorkOrders();
    this.taskStore.loadAllTasks();
  }

  /**
   * Navigates back to the vehicle list.
   */
  protected goBack(): void {
    this.router.navigate(['/admin/vehicles']);
  }

  /**
   * Navigates to the task management page.
   * If an active work order exists, the work order and vehicle IDs are passed
   * as query parameters.
   */
  protected goToNewTask(): void {
    const order = this.activeWorkOrder();

    if (order?.id) {
      this.router.navigate(['/admin/tasks'], {
        queryParams: {
          workOrderId: order.id,
          vehicleId: this.vehicleId
        }
      });

      return;
    }

    this.router.navigate(['/admin/tasks']);
  }

  /**
   * Navigates to the work order associated with the current vehicle.
   */
  protected goToWorkOrder(): void {
    const order = this.activeWorkOrder();

    if (order?.id) {
      this.router.navigate(['/admin/work-orders', order.id]);
      return;
    }

    this.router.navigate(['/admin/work-orders']);
  }

  /**
   * Returns the full vehicle name using brand and model.
   *
   * @param vehicle Vehicle entity used to build the display name.
   * @returns Vehicle brand and model.
   */
  protected getVehicleName(vehicle: Vehicle): string {
    return `${vehicle.brand} ${vehicle.model}`;
  }

  /**
   * Returns the translation key for the current vehicle status.
   *
   * @param status Vehicle status received from the store.
   * @returns Translation key for the vehicle status.
   */
  protected getStatusTranslationKey(status: Vehicle['status']): string {
    if (status === 'En Taller') {
      return 'VEHICLE_DETAIL.STATUS.IN_PROGRESS';
    }

    if (status === 'Listo') {
      return 'VEHICLE_DETAIL.STATUS.COMPLETED';
    }

    if (status === 'Entregado') {
      return 'VEHICLE_DETAIL.STATUS.DELIVERED';
    }

    return 'VEHICLE_DETAIL.STATUS.PENDING';
  }

  /**
   * Returns the translation key for the current task status.
   *
   * @param status Task status received from the store.
   * @returns Translation key for the task status.
   */
  protected getTaskStatusTranslationKey(status: Task['status']): string {
    if (status === 'Completada') {
      return 'VEHICLE_DETAIL.STATUS.COMPLETED';
    }

    if (status === 'En Proceso') {
      return 'VEHICLE_DETAIL.STATUS.IN_PROGRESS';
    }

    return 'VEHICLE_DETAIL.STATUS.PENDING';
  }

  /**
   * Returns the CSS class corresponding to the current task status.
   *
   * @param status Task status received from the store.
   * @returns CSS class for the task status.
   */
  protected getTaskStatusClass(status: Task['status']): string {
    if (status === 'Completada') {
      return 'task-completed';
    }

    if (status === 'En Proceso') {
      return 'task-progress';
    }

    return 'task-pending';
  }

  /**
   * Returns the Material icon name corresponding to the current task status.
   *
   * @param status Task status received from the store.
   * @returns Material icon name.
   */
  protected getTaskIcon(status: Task['status']): string {
    if (status === 'Completada') {
      return 'check_circle';
    }

    if (status === 'En Proceso') {
      return 'sync';
    }

    return 'schedule';
  }
}