/**
 * WorkOrderDetailComponent
 * 
 * Complete detail component of a Work Order.
 * Displays all the information of the order, the associated vehicle,
 * the overall progress and allows managing the related tasks.
 * 
 * Main functionalities:
 * - Visualization of order and vehicle data
 * - Task management (add, change status)
 * - Edición del precio de la orden
 * - Cálculo automático de progreso
 * 
 * @component
 * @selector app-work-order-detail
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';
import { TaskStore } from '../../application/task.store';
import { WorkOrderStore } from '../../application/work-order.store';
import { Task, WorkOrder } from '../../domain/models/work-order.model';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule
  ],
  templateUrl: './work-order-detail.html',
  styleUrl: './work-order-detail.css'
})
export class WorkOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly workOrderStore = inject(WorkOrderStore);
  protected readonly taskStore = inject(TaskStore);
  protected readonly mechanicStore = inject(MechanicStore);
  protected readonly vehicleStore = inject(VehicleStore);

  /** ID of the order obtained from the URL */
  protected readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';

  /** Controls the visibility of the new task dialog */
  protected readonly taskDialog = signal(false);

  protected readonly taskStatusOptions: Task['status'][] = [
    'Pendiente',
    'En Proceso',
    'Completada'
  ];

  /** Editable price locally */
  protected localPrice = 0;

  /** New task being created */
  protected newTask: Task = this.getEmptyTask();

  /** Current work order */
  protected readonly order = computed<WorkOrder | undefined>(() =>
    this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(this.orderId))
  );

  /** Vehicle associated with the order */
  protected readonly vehicle = computed(() => {
    const order = this.order();

    if (!order) {
      return undefined;
    }

    return this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(order.vehicleId));
  });

  /** Tareas pertenecientes a esta orden */
  protected readonly orderTasks = computed<Task[]>(() =>
    this.taskStore
      .tasks()
      .filter((task) => String(task.workOrderId) === String(this.orderId))
  );

  /** Number of completed tasks */
  protected readonly completedTasks = computed(() =>
    this.orderTasks().filter((task) => task.status === 'Completada').length
  );

  /** Percentage of order progress */
  protected readonly progress = computed(() => {
    const tasks = this.orderTasks();

    if (!tasks.length) {
      return 0;
    }

    return Math.round((this.completedTasks() / tasks.length) * 100);
  });

  ngOnInit(): void {
    this.workOrderStore.loadWorkOrders();
    this.taskStore.loadAllTasks();
    this.mechanicStore.loadMechanics();
    this.vehicleStore.loadVehicles();

    // A slight delay to ensure the order has been loaded
    setTimeout(() => {
      this.localPrice = Number(this.order()?.price || 0);
    }, 250);
  }

  protected goBack(): void {
    this.router.navigate(['/admin/work-orders']);
  }

  /** Opens the dialog to add a new task */
  protected openTaskDialog(): void {
    this.newTask = this.getEmptyTask();
    this.taskDialog.set(true);
  }

  protected closeTaskDialog(): void {
    this.taskDialog.set(false);
  }

  /** Saves a new task associated with this order */
  protected saveTask(): void {
    if (!this.newTask.description || !this.newTask.mechanicId) {
      return;
    }

    this.taskStore.addTask(this.newTask);
    this.closeTaskDialog();
  }

  /**
   * Updates the status of a specific task.
   */
  protected updateTaskStatus(task: Task, status: Task['status']): void {
    if (!task.id) {
      return;
    }

    this.taskStore.updateTaskStatus(task.id, status);
  }

  /** Saves the modified price of the order */
  protected savePrice(): void {
    const order = this.order();

    if (!order?.id) {
      return;
    }

    const updatedOrder: WorkOrder = {
      ...order,
      price: Number(this.localPrice || 0)
    };

    this.workOrderStore.updateWorkOrder(order.id, updatedOrder);
  }

  protected getMechanicName(mechanicId: string): string {
    if (!mechanicId) {
      return 'Sin asignar';
    }

    const mechanic = this.mechanicStore
      .mechanics()
      .find((item) => String(item.id) === String(mechanicId));

    return mechanic?.fullName ?? 'Mecánico no encontrado';
  }

  protected getVehicleName(): string {
    const vehicle = this.vehicle();

    if (!vehicle) {
      return 'Vehículo no encontrado';
    }

    return `${vehicle.brand} ${vehicle.model}`;
  }

  protected getTaskIcon(status: Task['status']): string {
    if (status === 'Completada') {
      return 'check_circle';
    }

    if (status === 'En Proceso') {
      return 'sync';
    }

    return 'schedule';
  }

  protected getTaskClass(status: Task['status']): string {
    if (status === 'Completada') {
      return 'task-completed';
    }

    if (status === 'En Proceso') {
      return 'task-progress';
    }

    return 'task-pending';
  }

  private getEmptyTask(): Task {
    return {
      workOrderId: this.orderId,
      description: '',
      status: 'Pendiente',
      mechanicId: ''
    };
  }
}
