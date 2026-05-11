import { Injectable, inject, signal } from '@angular/core';
import { WorkOrderService } from '../infrastructure/services/work-order.service';
import { Task } from '../domain/models/work-order.model';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly service = inject(WorkOrderService);

  readonly tasks = signal<Task[]>([]);
  readonly isLoading = signal<boolean>(false);

  loadAllTasks(): void {
    this.isLoading.set(true);

    this.service.getAllTasks().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando tareas:', err);
        this.isLoading.set(false);
      }
    });
  }

  addTask(task: Task): void {
    this.service.createTask(task).subscribe({
      next: (newTask) => this.tasks.update((list) => [...list, newTask]),
      error: (err) => console.error('Error creando tarea:', err)
    });
  }

  updateTask(id: string, task: Task): void {
    this.service.updateTask(id, task).subscribe({
      next: (updatedTask) => {
        this.tasks.update((list) =>
          list.map((item) => String(item.id) === String(id) ? updatedTask : item)
        );
      },
      error: (err) => console.error('Error actualizando tarea:', err)
    });
  }

  updateTaskStatus(id: string, status: Task['status']): void {
    this.service.updateTaskStatus(id, status).subscribe({
      next: (updatedTask) => {
        this.tasks.update((list) =>
          list.map((item) => String(item.id) === String(id) ? updatedTask : item)
        );
      },
      error: (err) => console.error('Error actualizando estado:', err)
    });
  }

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
