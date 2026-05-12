/**
 * TaskStore
 * 
 * Reactive store based on Signals that manages the state of tasks
 * techniques within the work orders.
 * 
 * @service
 * @providedIn 'root'
 */
import { Injectable, inject, signal } from '@angular/core';
import { WorkOrderService } from '../infrastructure/services/work-order.service';
import { Task } from '../domain/models/work-order.model';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly service = inject(WorkOrderService);

  /** Reactive list of all tasks */
  readonly tasks = signal<Task[]>([]);

  /** Indicates if information is being loaded */
  readonly isLoading = signal<boolean>(false);

  /**
   * Loads all tasks from the backend.
   */
  loadAllTasks(): void {
    this.isLoading.set(true);

    this.service.getAllTasks().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Adds a new task.
   * @param task - Data of the task to create
   */
  addTask(task: Task): void {
    this.service.createTask(task).subscribe({
      next: (newTask) => this.tasks.update((list) => [...list, newTask]),
      error: (err) => console.error('Error creando tarea:', err)
    });
  }

  /**
   * Updates a task completely.
   */
  updateTask(id: string, task: Task): void {
    this.service.updateTask(id, task).subscribe({
      next: (updatedTask) => {
        this.tasks.update((list) =>
          list.map((item) => String(item.id) === String(id) ? updatedTask : item)
        );
      },
      error: (err) => console.error('Error updating task:', err)
    });
  }

  /**
   * Updates only the status of a task.
   */
  updateTaskStatus(id: string, status: Task['status']): void {
    this.service.updateTaskStatus(id, status).subscribe({
      next: (updatedTask) => {
        this.tasks.update((list) =>
          list.map((item) => String(item.id) === String(id) ? updatedTask : item)
        );
      },
      error: (err) => console.error('Error updating task status:', err)
    });
  }

  /**
   * Deletes a task.
   * @param id - ID of the task to delete
   */
  deleteTask(id: string): void {
    this.service.deleteTask(id).subscribe({
      next: () => {
        this.tasks.update((list) =>
          list.filter((item) => String(item.id) !== String(id))
        );
      },
      error: (err) => console.error('Error eliminando tarea:', err)
    });
  }
}
