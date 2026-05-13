/**
 * TasksViewComponent
 *
 * Main view for workshop task management.
 * It allows users to view, filter, create, edit, delete and update
 * the status of workshop tasks.
 *
 * This component includes:
 * - Search, status and mechanic filters.
 * - Task cards for each task.
 * - A dialog for creating and editing tasks.
 * - Real-time task statistics.
 * - Navigation to related work orders.
 *
 * @component
 * @selector app-tasks-view
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';
import { TaskStore } from '../../application/task.store';
import { WorkOrderStore } from '../../application/work-order.store';
import { Task } from '../../domain/models/work-order.model';
import { TaskCardComponent, TaskCardView } from './components/task-card/task-card';
import { TaskDialogComponent } from './components/task-dialog/task-dialog';
import { TaskFiltersComponent } from './components/task-filters/task-filters';

type TaskPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';

@Component({
  selector: 'app-tasks-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    TaskFiltersComponent,
    TaskCardComponent,
    TaskDialogComponent
  ],
  templateUrl: './tasks-view.html',
  styleUrl: './tasks-view.css'
})
export class TasksViewComponent implements OnInit {

  /**
   * Store responsible for managing task data.
   */
  protected readonly taskStore = inject(TaskStore);

  /**
   * Store responsible for managing work order data.
   */
  protected readonly workOrderStore = inject(WorkOrderStore);

  /**
   * Store responsible for managing mechanic data.
   */
  protected readonly mechanicStore = inject(MechanicStore);

  /**
   * Router used for navigation.
   */
  private readonly router = inject(Router);

  /**
   * Translation service used for TypeScript-generated messages.
   */
  private readonly translate = inject(TranslateService);

  /**
   * Current search term used by the task filters.
   */
  protected readonly search = signal('');

  /**
   * Current selected task status used by the filters.
   */
  protected readonly selectedStatus = signal<Task['status'] | null>(null);

  /**
   * Current selected mechanic ID used by the filters.
   */
  protected readonly selectedMechanicId = signal<string | null>(null);

  /**
   * Controls whether the task dialog is visible.
   */
  protected readonly displayDialog = signal(false);

  /**
   * Task currently being created or edited in the dialog.
   */
  protected taskForm: Task = this.getEmptyTask();

  /**
   * Available task status options.
   */
  protected readonly statusOptions: Task['status'][] = [
    'Pendiente',
    'En Proceso',
    'Completada'
  ];

  /**
   * Available task priority options.
   */
  protected readonly priorityOptions: TaskPriority[] = [
    'Baja',
    'Media',
    'Alta',
    'Crítica'
  ];

  /**
   * Enriched task view models used by task cards.
   */
  protected readonly tasksView = computed<TaskCardView[]>(() =>
    this.taskStore.tasks().map((task) => ({
      id: String(task.id ?? crypto.randomUUID()),
      raw: task,
      description: task.description || this.translate.instant('TASKS_VIEW.NO_DESCRIPTION'),
      workOrderId: task.workOrderId,
      workOrderCode: this.getWorkOrderCode(task.workOrderId),
      mechanicId: task.mechanicId,
      mechanicName: this.getMechanicName(task.mechanicId),
      status: task.status || 'Pendiente',
      priority: task.priority || 'Media',
      estimatedTime: task.estimatedTime || 2,
      photo: task.photo
    }))
  );

  /**
   * Filtered task list based on search term, selected status and selected mechanic.
   */
  protected readonly filteredTasks = computed(() => {
    const term = this.search().toLowerCase().trim();
    const selectedStatus = this.selectedStatus();
    const selectedMechanicId = this.selectedMechanicId();

    return this.tasksView().filter((task) => {
      const matchesSearch =
        !term ||
        task.description.toLowerCase().includes(term) ||
        task.workOrderCode.toLowerCase().includes(term) ||
        task.mechanicName.toLowerCase().includes(term);

      const matchesStatus =
        !selectedStatus || task.status === selectedStatus;

      const matchesMechanic =
        !selectedMechanicId || String(task.mechanicId) === String(selectedMechanicId);

      return matchesSearch && matchesStatus && matchesMechanic;
    });
  });

  /**
   * Number of pending tasks.
   */
  protected readonly pendingTasks = computed(() =>
    this.taskStore.tasks().filter((task) => task.status === 'Pendiente').length
  );

  /**
   * Number of tasks currently in progress.
   */
  protected readonly inProgressTasks = computed(() =>
    this.taskStore.tasks().filter((task) => task.status === 'En Proceso').length
  );

  /**
   * Number of completed tasks.
   */
  protected readonly completedTasks = computed(() =>
    this.taskStore.tasks().filter((task) => task.status === 'Completada').length
  );

  /**
   * Loads all data required by the task management view.
   */
  ngOnInit(): void {
    this.loadAllData();
  }

  /**
   * Loads tasks, work orders and mechanics.
   */
  protected loadAllData(): void {
    this.taskStore.loadAllTasks();

    if (this.workOrderStore.workOrders().length === 0) {
      this.workOrderStore.loadWorkOrders();
    }

    if (this.mechanicStore.mechanics().length === 0) {
      this.mechanicStore.loadMechanics();
    }
  }

  /**
   * Updates the search term filter.
   *
   * @param value New search term.
   */
  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  /**
   * Updates the selected status filter.
   *
   * @param value Selected task status or null.
   */
  protected onStatusFilterChange(value: Task['status'] | null): void {
    this.selectedStatus.set(value);
  }

  /**
   * Updates the selected mechanic filter.
   *
   * @param value Selected mechanic ID or null.
   */
  protected onMechanicFilterChange(value: string | null): void {
    this.selectedMechanicId.set(value);
  }

  /**
   * Opens the dialog to create a new task.
   */
  protected openDialog(): void {
    this.taskForm = this.getEmptyTask();
    this.displayDialog.set(true);
  }

  /**
   * Opens the dialog to edit an existing task.
   *
   * @param task Task selected for editing.
   */
  protected editTask(task: Task): void {
    this.taskForm = {
      ...task,
      priority: task.priority || 'Media',
      estimatedTime: task.estimatedTime || 2
    };

    this.displayDialog.set(true);
  }

  /**
   * Closes the task dialog and resets the form.
   */
  protected hideDialog(): void {
    this.displayDialog.set(false);
    this.taskForm = this.getEmptyTask();
  }

  /**
   * Saves a new task or updates an existing one.
   */
  protected saveTask(): void {
    if (!this.taskForm.description || !this.taskForm.workOrderId) {
      return;
    }

    if (this.taskForm.id) {
      this.taskStore.updateTask(this.taskForm.id, this.taskForm);
    } else {
      this.taskStore.addTask(this.taskForm);
    }

    this.hideDialog();
  }

  /**
   * Deletes a task after user confirmation.
   *
   * @param task Task selected for deletion.
   */
  protected deleteTask(task: Task): void {
    if (!task.id) {
      return;
    }

    const confirmed = window.confirm(
      `${this.translate.instant('TASKS_VIEW.DELETE_CONFIRM_START')} "${task.description}"?`
    );

    if (!confirmed) {
      return;
    }

    this.taskStore.deleteTask(task.id);
  }

  /**
   * Updates a task status from the task card event.
   *
   * @param event Task and new status data.
   */
  protected onStatusChange(event: { task: Task; status: Task['status'] }): void {
    if (event.task.id) {
      this.taskStore.updateTaskStatus(event.task.id, event.status);
    }
  }

  /**
   * Navigates to the related work order page.
   *
   * @param workOrderId Work order identifier.
   */
  protected goToWorkOrder(workOrderId: string): void {
    if (workOrderId) {
      this.router.navigate(['/admin/work-orders', workOrderId]);
    }
  }

  /**
   * Gets the work order tracking code.
   *
   * @param workOrderId Work order identifier.
   * @returns Tracking code or fallback value.
   */
  protected getWorkOrderCode(workOrderId: string): string {
    if (!workOrderId) {
      return 'N/A';
    }

    const workOrder = this.workOrderStore
      .workOrders()
      .find((order) => String(order.id) === String(workOrderId));

    return workOrder?.trackingCode ?? this.translate.instant('TASKS_VIEW.UNKNOWN_ORDER');
  }

  /**
   * Gets the mechanic full name.
   *
   * @param mechanicId Mechanic identifier.
   * @returns Mechanic name or fallback value.
   */
  protected getMechanicName(mechanicId: string): string {
    if (!mechanicId) {
      return this.translate.instant('TASKS_VIEW.UNASSIGNED');
    }

    const mechanic = this.mechanicStore
      .mechanics()
      .find((item) => String(item.id) === String(mechanicId));

    return mechanic?.fullName ?? this.translate.instant('TASKS_VIEW.NOT_FOUND');
  }

  /**
   * Creates an empty task with default values.
   *
   * @returns Default task object.
   */
  private getEmptyTask(): Task {
    const defaultOrderId = this.workOrderStore.workOrders()[0]?.id ?? '';
    const defaultMechanicId = this.mechanicStore.mechanics()[0]?.id ?? '';

    return {
      description: '',
      workOrderId: String(defaultOrderId),
      mechanicId: String(defaultMechanicId),
      status: 'Pendiente',
      priority: 'Media',
      estimatedTime: 2
    };
  }
}