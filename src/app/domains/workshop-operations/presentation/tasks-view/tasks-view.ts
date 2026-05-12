/**
 * TasksViewComponent
 * 
 * Main view of workshop task management.
 * Allows viewing, filtering, creating, editing and deleting tasks.
 * 
 * Includes:
 * - Advanced filters (search, status, mechanic)
 * - Task cards (`TaskCardComponent`)
 * - Dialog for creating/editing tasks (`TaskDialogComponent`)
 * - Real-time statistics
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
    TaskFiltersComponent,
    TaskCardComponent,
    TaskDialogComponent
  ],
  templateUrl: './tasks-view.html',
  styleUrl: './tasks-view.css'
})
export class TasksViewComponent implements OnInit {
  protected readonly taskStore = inject(TaskStore);
  protected readonly workOrderStore = inject(WorkOrderStore);
  protected readonly mechanicStore = inject(MechanicStore);
  private readonly router = inject(Router);

  // Reactive filters
  protected readonly search = signal('');
  protected readonly selectedStatus = signal<Task['status'] | null>(null);
  protected readonly selectedMechanicId = signal<string | null>(null);
  protected readonly displayDialog = signal(false);

  /** Task being created or edited in the dialog */
  protected taskForm: Task = this.getEmptyTask();

  protected readonly statusOptions: Task['status'][] = [
    'Pendiente',
    'En Proceso',
    'Completada'
  ];

  protected readonly priorityOptions: TaskPriority[] = [
    'Baja',
    'Media',
    'Alta',
    'Crítica'
  ];

  /** Enriched view of tasks for display in cards */
  protected readonly tasksView = computed<TaskCardView[]>(() =>
    this.taskStore.tasks().map((task) => ({
      id: String(task.id ?? crypto.randomUUID()),
      raw: task,
      description: task.description || 'Tarea sin descripción',
      workOrderId: task.workOrderId,
      workOrderCode: this.getWorkOrderCode(task.workOrderId),
      mechanicId: task.mechanicId,
      mechanicName: this.getMechanicName(task.mechanicId),
      status: task.status || 'Pendiente',
      priority: task.priority || 'Media',
      estimatedTime: task.estimatedTime || 2,
      photo: task.photo,
    }))
  );

  /** Filtered tasks based on current criteria */
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

  protected readonly pendingTasks = computed(() =>
    this.taskStore.tasks().filter((task) => task.status === 'Pendiente').length
  );

  protected readonly inProgressTasks = computed(() =>
    this.taskStore.tasks().filter((task) => task.status === 'En Proceso').length
  );

  protected readonly completedTasks = computed(() =>
    this.taskStore.tasks().filter((task) => task.status === 'Completada').length
  );

  ngOnInit(): void {
    this.loadAllData();
  }

  /** Loads initial data needed */
  protected loadAllData(): void {
    this.taskStore.loadAllTasks();

    if (this.workOrderStore.workOrders().length === 0) {
      this.workOrderStore.loadWorkOrders();
    }

    if (this.mechanicStore.mechanics().length === 0) {
      this.mechanicStore.loadMechanics();
    }
  }
  // MMethods for filters
  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  protected onStatusFilterChange(value: Task['status'] | null): void {
    this.selectedStatus.set(value);
  }

  protected onMechanicFilterChange(value: string | null): void {
    this.selectedMechanicId.set(value);
  }
  /** Opens the dialog to create a new task */
  protected openDialog(): void {
    this.taskForm = this.getEmptyTask();
    this.displayDialog.set(true);
  }
  /** Opens the dialog to edit an existing task */
  protected editTask(task: Task): void {
    this.taskForm = {
      ...task,
      priority: task.priority || 'Media',
      estimatedTime: task.estimatedTime || 2
    };
    this.displayDialog.set(true);
  }

  protected hideDialog(): void {
    this.displayDialog.set(false);
    this.taskForm = this.getEmptyTask();
  }
  /** Saves or updates the task based on whether it has an ID */
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

  protected deleteTask(task: Task): void {
    if (!task.id) {
      return;
    }

    const confirmed = window.confirm(`¿Eliminar la tarea "${task.description}"?`);

    if (!confirmed) {
      return;
    }

    this.taskStore.deleteTask(task.id);
  }

  protected onStatusChange(event: { task: Task; status: Task['status'] }): void {
    if (event.task.id) {
      this.taskStore.updateTaskStatus(event.task.id, event.status);
    }
  }

  protected goToWorkOrder(workOrderId: string): void {
    if (workOrderId) {
      this.router.navigate(['/admin/work-orders', workOrderId]);
    }
  }

  // MMethods for auxiliary functionality
  protected getWorkOrderCode(workOrderId: string): string {
    if (!workOrderId) {
      return 'N/A';
    }

    const workOrder = this.workOrderStore
      .workOrders()
      .find((order) => String(order.id) === String(workOrderId));

    return workOrder?.trackingCode ?? 'Desconocida';
  }

  protected getMechanicName(mechanicId: string): string {
    if (!mechanicId) {
      return 'Sin asignar';
    }

    const mechanic = this.mechanicStore
      .mechanics()
      .find((item) => String(item.id) === String(mechanicId));

    return mechanic?.fullName ?? 'No encontrado';
  }

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
