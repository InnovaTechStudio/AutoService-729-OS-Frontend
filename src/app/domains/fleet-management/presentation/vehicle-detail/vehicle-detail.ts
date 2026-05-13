/**
 * VehicleDetailComponent
 *
 * Component for displaying detailed information about a vehicle. Shows all relevant information
 * about a vehicle within the workshop, including:
 * - Basic vehicle data
 * - Owner information
 * - Active work order
 * - Progress of technical tasks
 * - Diagnosis and reported problems
 *
 * Uses Signals and `computed()` for efficient reactivity and automatic updates
 * without the need for manual subscriptions.
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

import { CustomerStore } from '../../../customer-management/application/customer.store';
import { Vehicle } from '../../domain/models/vehicle.model';
import { VehicleStore } from '../../application/vehicle.store';
import { TaskStore } from '../../../workshop-operations/application/task.store';
import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';
import { Task, WorkOrder } from '../../../workshop-operations/domain/models/work-order.model';
import { TranslatePipe } from '@ngx-translate/core';

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
    TranslatePipe,
  ],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css',
})
export class VehicleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly vehicleStore = inject(VehicleStore);
  private readonly customerStore = inject(CustomerStore);
  private readonly workOrderStore = inject(WorkOrderStore);
  private readonly taskStore = inject(TaskStore);

  /** ID of the vehicle obtained from the URL */
  protected readonly vehicleId = this.route.snapshot.paramMap.get('id') ?? '';

  /** Current vehicle obtained from the store */
  protected readonly vehicle = computed<Vehicle | undefined>(() =>
    this.vehicleStore.vehicles().find((item) => String(item.id) === String(this.vehicleId)),
  );

  /** Name of the vehicle owner */
  protected readonly ownerName = computed(() => {
    const currentVehicle = this.vehicle();

    if (!currentVehicle) {
      return 'No asignado';
    }

    const customer = this.customerStore
      .customers()
      .find((item) => String(item.id) === String(currentVehicle.customerId));

    return customer?.fullName ?? 'No asignado';
  });

  /** Active work order associated with the vehicle */
  protected readonly activeWorkOrder = computed<WorkOrder | undefined>(() => {
    const currentVehicle = this.vehicle();

    if (!currentVehicle) {
      return undefined;
    }

    return this.workOrderStore
      .workOrders()
      .find((order) => String(order.vehicleId) === String(currentVehicle.id));
  });

  /** List of tasks associated with the active work order */
  protected readonly vehicleTasks = computed<Task[]>(() => {
    const currentOrder = this.activeWorkOrder();

    if (!currentOrder) {
      return [];
    }

    return this.taskStore
      .tasks()
      .filter((task) => String(task.workOrderId) === String(currentOrder.id));
  });

  /** Number of completed tasks */
  protected readonly completedTasks = computed(
    () => this.vehicleTasks().filter((task) => task.status === 'Completada').length,
  );

  /** Overall progress percentage of the vehicle (based on tasks or status) */
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

  /** Problem reported by the client (description of the order) */
  protected readonly problemReported = computed(
    () =>
      this.activeWorkOrder()?.description ??
      'Ruido en el motor al acelerar en frío y pérdida leve de potencia.',
  );

  /** Current technical diagnosis based on the available information */
  protected readonly technicalDiagnosis = computed(() => {
    const order = this.activeWorkOrder();

    if (!order) {
      return 'Diagnóstico pendiente de registro técnico.';
    }

    if (this.vehicleTasks().length === 0) {
      return 'Se requiere registrar tareas técnicas para completar el diagnóstico operativo.';
    }

    return 'Revisión técnica registrada. Se identificaron tareas asociadas al mantenimiento del vehículo.';
  });

  ngOnInit(): void {
    this.vehicleStore.loadVehicles();
    this.customerStore.loadCustomers();
    this.workOrderStore.loadWorkOrders();
    this.taskStore.loadAllTasks();
  }

  /**
   * Navigate back to the vehicle list.
   */
  protected goBack(): void {
    this.router.navigate(['/admin/vehicles']);
  }

  /**
   * Navigate to the creation or management of tasks for this vehicle.
   */
  protected goToNewTask(): void {
    const order = this.activeWorkOrder();

    if (order?.id) {
      this.router.navigate(['/admin/tasks'], {
        queryParams: {
          workOrderId: order.id,
          vehicleId: this.vehicleId,
        },
      });

      return;
    }

    this.router.navigate(['/admin/tasks']);
  }

  /**
   * Navigate to the work order associated with the vehicle.
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
   * Returns the full name of the vehicle (Brand + Model).
   * @param vehicle - Vehicle for which to get the name
   */
  protected getVehicleName(vehicle: Vehicle): string {
    return `${vehicle.brand} ${vehicle.model}`;
  }

  /**
   * Returns a friendly label based on the vehicle's status.
   */
  protected getStatusLabel(status: Vehicle['status']): string {
    if (status === 'En Taller') {
      return 'En curso';
    }

    if (status === 'Listo') {
      return 'Completado';
    }

    return 'Entregado';
  }

  /**
   * Returns a friendly label for the status of a task.
   */
  protected getTaskStatusLabel(status: Task['status']): string {
    if (status === 'En Proceso') {
      return 'En curso';
    }

    return status;
  }

  /**
   * Returns the CSS class corresponding to the status of a task.
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
   * Returns the name of the Material icon for the status of a task.
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
