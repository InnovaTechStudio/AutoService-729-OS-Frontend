/**
 * WorkOrderDetailComponent
 *
 * Complete detail component for a work order.
 * It displays order information, the associated vehicle, overall progress,
 * assigned tasks, price editing and a quality checklist before delivery.
 *
 * Main features:
 * - Work order and vehicle visualization.
 * - Task management: add tasks and update task status.
 * - Editable total price.
 * - Automatic progress calculation.
 * - Quality checklist before marking the order as ready for delivery.
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
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    MatCheckboxModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './work-order-detail.html',
  styleUrl: './work-order-detail.css'
})
export class WorkOrderDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly workOrderStore = inject(WorkOrderStore);
  protected readonly taskStore = inject(TaskStore);
  protected readonly mechanicStore = inject(MechanicStore);
  protected readonly vehicleStore = inject(VehicleStore);

  /**
   * Work order ID obtained from the current route.
   */
  protected readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';

  /**
   * Controls the visibility of the new task dialog.
   */
  protected readonly taskDialog = signal(false);

  /**
   * Available task status options.
   */
  protected readonly taskStatusOptions: Task['status'][] = [
    'Pendiente',
    'En Proceso',
    'Completada'
  ];

  /**
   * Indicates whether final evidence has been registered.
   */
  protected readonly finalEvidenceRegistered = signal(false);

  /**
   * Indicates whether the supervisor approved the order review.
   */
  protected readonly supervisorApproved = signal(false);

  /**
   * Indicates whether all tasks are completed.
   */
  protected readonly allTasksCompleted = computed(() => {
    const tasks = this.orderTasks();

    return tasks.length > 0 &&
      tasks.every((task) => task.status === 'Completada');
  });

  /**
   * Indicates whether the total cost has been registered.
   */
  protected readonly costsValidated = computed(() => {
    const order = this.order();

    return Number(order?.price || this.localPrice || 0) > 0;
  });

  /**
   * Indicates whether the order has a diagnosis or description.
   */
  protected readonly diagnosticRegistered = computed(() => {
    const order = this.order();

    return !!order?.description &&
      order.description.trim().length > 0;
  });

  /**
   * Indicates whether the order can be marked as ready for delivery.
   */
  protected readonly canMarkReadyForDelivery = computed(() =>
    this.allTasksCompleted() &&
    this.finalEvidenceRegistered() &&
    this.costsValidated() &&
    this.diagnosticRegistered() &&
    this.supervisorApproved()
  );

  /**
   * Editable local price value.
   */
  protected localPrice = 0;

  /**
   * New task being created from the inline dialog.
   */
  protected newTask: Task = this.getEmptyTask();

  /**
   * Current work order.
   */
  protected readonly order = computed<WorkOrder | undefined>(() =>
    this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(this.orderId))
  );

  /**
   * Vehicle associated with the current order.
   */
  protected readonly vehicle = computed(() => {
    const order = this.order();

    if (!order) {
      return undefined;
    }

    return this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(order.vehicleId));
  });

  /**
   * Tasks belonging to the current order.
   */
  protected readonly orderTasks = computed<Task[]>(() =>
    this.taskStore
      .tasks()
      .filter((task) => String(task.workOrderId) === String(this.orderId))
  );

  /**
   * Number of completed tasks.
   */
  protected readonly completedTasks = computed(() =>
    this.orderTasks()
      .filter((task) => task.status === 'Completada').length
  );

  /**
   * Order progress percentage based on completed tasks.
   */
  protected readonly progress = computed(() => {
    const tasks = this.orderTasks();

    if (!tasks.length) {
      return 0;
    }

    return Math.round((this.completedTasks() / tasks.length) * 100);
  });

  /**
   * Loads order, task, mechanic and vehicle data.
   */
  ngOnInit(): void {
    this.workOrderStore.loadWorkOrders();
    this.taskStore.loadAllTasks();
    this.mechanicStore.loadMechanics();
    this.vehicleStore.loadVehicles();

    setTimeout(() => {
      this.localPrice = Number(this.order()?.price || 0);
    }, 250);
  }

  /**
   * Navigates back to the work order list.
   */
  protected goBack(): void {
    this.router.navigate(['/admin/work-orders']);
  }

  /**
   * Updates the final evidence checklist value.
   *
   * @param value Checkbox value.
   */
  protected toggleFinalEvidence(value: boolean): void {
    this.finalEvidenceRegistered.set(value);
  }

  /**
   * Updates the supervisor approval checklist value.
   *
   * @param value Checkbox value.
   */
  protected toggleSupervisorApproval(value: boolean): void {
    this.supervisorApproved.set(value);
  }

  /**
   * Marks the order as finished when all quality conditions are met.
   */
  protected markOrderAsReadyForDelivery(): void {
    const order = this.order();

    if (!order?.id || !this.canMarkReadyForDelivery()) {
      return;
    }

    const updatedOrder: WorkOrder = {
      ...order,
      status: 'Finalizado',
      price: Number(this.localPrice || order.price || 0)
    };

    this.workOrderStore.updateWorkOrder(order.id, updatedOrder);
  }

  /**
   * Opens the dialog to add a new task.
   */
  protected openTaskDialog(): void {
    this.newTask = this.getEmptyTask();
    this.taskDialog.set(true);
  }

  /**
   * Closes the new task dialog.
   */
  protected closeTaskDialog(): void {
    this.taskDialog.set(false);
  }

  /**
   * Saves a new task associated with the current work order.
   */
  protected saveTask(): void {
    if (!this.newTask.description || !this.newTask.mechanicId) {
      return;
    }

    this.taskStore.addTask(this.newTask);

    this.closeTaskDialog();
  }

  /**
   * Updates the status of a specific task.
   *
   * @param task Task to update.
   * @param status New task status.
   */
  protected updateTaskStatus(task: Task, status: Task['status']): void {
    if (!task.id) {
      return;
    }

    this.taskStore.updateTaskStatus(task.id, status);
  }

  /**
   * Saves the modified price of the order.
   */
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

  /**
   * Returns the mechanic name by mechanic ID.
   *
   * @param mechanicId Mechanic identifier.
   * @returns Mechanic name or translated fallback.
   */
  protected getMechanicName(mechanicId: string): string {
    if (!mechanicId) {
      return this.translate.instant('WORK_ORDER_DETAIL.UNASSIGNED');
    }

    const mechanic = this.mechanicStore
      .mechanics()
      .find((item) => String(item.id) === String(mechanicId));

    return mechanic?.fullName ?? this.translate.instant('WORK_ORDER_DETAIL.MECHANIC_NOT_FOUND');
  }

  /**
   * Returns the vehicle name associated with the current order.
   *
   * @returns Vehicle brand and model, or translated fallback.
   */
  protected getVehicleName(): string {
    const vehicle = this.vehicle();

    if (!vehicle) {
      return this.translate.instant('WORK_ORDER_DETAIL.VEHICLE_NOT_FOUND');
    }

    return `${vehicle.brand} ${vehicle.model}`;
  }

  /**
   * Returns the Material icon name according to a task status.
   *
   * @param status Task status.
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

  /**
   * Returns the CSS class according to a task status.
   *
   * @param status Task status.
   * @returns CSS class for task status.
   */
  protected getTaskClass(status: Task['status']): string {
    if (status === 'Completada') {
      return 'task-completed';
    }

    if (status === 'En Proceso') {
      return 'task-progress';
    }

    return 'task-pending';
  }

  /**
   * Returns the translation key for a task or order status.
   *
   * @param status Status value.
   * @returns Translation key for the status.
   */
  protected getStatusTranslationKey(status: string | undefined): string {
    if (status === 'Pendiente') return 'WORK_ORDER_DETAIL.STATUS.PENDING';
    if (status === 'En Proceso') return 'WORK_ORDER_DETAIL.STATUS.IN_PROGRESS';
    if (status === 'Completada') return 'WORK_ORDER_DETAIL.STATUS.COMPLETED';
    if (status === 'Finalizado') return 'WORK_ORDER_DETAIL.STATUS.FINISHED';

    return 'WORK_ORDER_DETAIL.STATUS.UNKNOWN';
  }

  /**
   * Creates an empty task assigned to the current order.
   *
   * @returns Empty task object.
   */
  private getEmptyTask(): Task {
    return {
      workOrderId: this.orderId,
      description: '',
      status: 'Pendiente',
      mechanicId: ''
    };
  }
}