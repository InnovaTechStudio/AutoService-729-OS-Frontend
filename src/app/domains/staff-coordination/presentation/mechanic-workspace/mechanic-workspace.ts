/**
 * MechanicWorkspaceComponent
 *
 * Workspace component for mechanics in the administration panel.
 * It allows a mechanic to review assigned tasks, track task progress,
 * update task statuses and navigate to the related work order.
 *
 * The component uses Angular Signals and computed values to calculate:
 * - The selected mechanic.
 * - Assigned tasks.
 * - Task counters by status.
 * - Overall completion progress.
 *
 * @component
 * @selector app-mechanic-workspace
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TaskStore } from '../../../workshop-operations/application/task.store';
import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { MechanicStore } from '../../application/mechanic.store';
import { Task } from '../../../workshop-operations/domain/models/work-order.model';

@Component({
  selector: 'app-mechanic-workspace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './mechanic-workspace.html',
  styleUrl: './mechanic-workspace.css'
})
export class MechanicWorkspaceComponent implements OnInit {

  /**
   * Store used to manage task data.
   */
  protected readonly taskStore = inject(TaskStore);

  /**
   * Store used to retrieve work order information.
   */
  protected readonly workOrderStore = inject(WorkOrderStore);

  /**
   * Store used to retrieve vehicle information related to work orders.
   */
  protected readonly vehicleStore = inject(VehicleStore);

  /**
   * Store used to retrieve mechanic information.
   */
  protected readonly mechanicStore = inject(MechanicStore);

  /**
   * Angular router used for navigation.
   */
  private readonly router = inject(Router);

  /**
   * Translation service used for TypeScript-generated labels.
   */
  private readonly translate = inject(TranslateService);

  /**
   * Currently selected mechanic ID.
   */
  protected readonly selectedMechanicId = signal<string>('');

  /**
   * Available task statuses.
   */
  protected readonly statusOptions: Task['status'][] = [
    'Pendiente',
    'En Proceso',
    'Completada'
  ];

  /**
   * Currently selected mechanic.
   */
  protected readonly currentMechanic = computed(() =>
    this.mechanicStore
      .mechanics()
      .find((mechanic) => String(mechanic.id) === String(this.selectedMechanicId()))
  );

  /**
   * Tasks assigned to the currently selected mechanic.
   */
  protected readonly assignedTasks = computed(() =>
    this.taskStore
      .tasks()
      .filter((task) => String(task.mechanicId) === String(this.selectedMechanicId()))
  );

  /**
   * Number of pending tasks assigned to the current mechanic.
   */
  protected readonly pendingTasks = computed(() =>
    this.assignedTasks().filter((task) => task.status === 'Pendiente').length
  );

  /**
   * Number of tasks currently in progress.
   */
  protected readonly inProgressTasks = computed(() =>
    this.assignedTasks().filter((task) => task.status === 'En Proceso').length
  );

  /**
   * Number of completed tasks.
   */
  protected readonly completedTasks = computed(() =>
    this.assignedTasks().filter((task) => task.status === 'Completada').length
  );

  /**
   * Overall progress percentage based on completed assigned tasks.
   */
  protected readonly progress = computed(() => {
    const tasks = this.assignedTasks();

    if (!tasks.length) {
      return 0;
    }

    return Math.round((this.completedTasks() / tasks.length) * 100);
  });

  /**
   * Loads mechanics, tasks, work orders and vehicles when the component starts.
   * It also selects the first available mechanic by default.
   */
  ngOnInit(): void {
    this.mechanicStore.loadMechanics();
    this.taskStore.loadAllTasks();
    this.workOrderStore.loadWorkOrders();
    this.vehicleStore.loadVehicles();

    setTimeout(() => {
      const firstMechanic = this.mechanicStore.mechanics()[0];

      if (firstMechanic?.id && !this.selectedMechanicId()) {
        this.selectedMechanicId.set(String(firstMechanic.id));
      }
    }, 300);
  }

  /**
   * Selects the mechanic whose tasks will be displayed.
   *
   * @param id Selected mechanic ID.
   */
  protected selectMechanic(id: string): void {
    this.selectedMechanicId.set(id);
  }

  /**
   * Updates the status of a task.
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
   * Gets the work order tracking code associated with a task.
   *
   * @param workOrderId Work order identifier.
   * @returns Work order tracking code or a fallback code.
   */
  protected getWorkOrderCode(workOrderId: string): string {
    const order = this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(workOrderId));

    return order?.trackingCode || `WO-${workOrderId}`;
  }

  /**
   * Gets the vehicle name associated with a work order.
   *
   * @param workOrderId Work order identifier.
   * @returns Vehicle name, model and plate, or a translated fallback label.
   */
  protected getVehicleName(workOrderId: string): string {
    const order = this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(workOrderId));

    if (!order) {
      return this.translate.instant('MECHANIC_WORKSPACE.VEHICLE_NOT_FOUND');
    }

    const vehicle = this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(order.vehicleId));

    return vehicle
      ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`
      : this.translate.instant('MECHANIC_WORKSPACE.VEHICLE_NOT_FOUND');
  }

  /**
   * Navigates to the work order detail page.
   *
   * @param workOrderId Work order identifier.
   */
  protected goToOrder(workOrderId: string): void {
    this.router.navigate(['/admin/work-orders', workOrderId]);
  }

  /**
   * Returns the CSS class corresponding to the task status.
   *
   * @param status Task status.
   * @returns CSS class for the task status.
   */
  protected getTaskClass(status: Task['status']): string {
    if (status === 'Completada') return 'task-completed';
    if (status === 'En Proceso') return 'task-progress';

    return 'task-pending';
  }

  /**
   * Returns the Material icon name corresponding to the task status.
   *
   * @param status Task status.
   * @returns Material icon name.
   */
  protected getTaskIcon(status: Task['status']): string {
    if (status === 'Completada') return 'check_circle';
    if (status === 'En Proceso') return 'sync';

    return 'schedule';
  }

  /**
   * Returns the translation key for a task status.
   *
   * @param status Task status.
   * @returns Translation key for the task status.
   */
  protected getTaskStatusTranslationKey(status: Task['status']): string {
    if (status === 'Pendiente') return 'MECHANIC_WORKSPACE.STATUS.PENDING';
    if (status === 'En Proceso') return 'MECHANIC_WORKSPACE.STATUS.IN_PROGRESS';
    if (status === 'Completada') return 'MECHANIC_WORKSPACE.STATUS.COMPLETED';

    return 'MECHANIC_WORKSPACE.STATUS.UNKNOWN';
  }
}