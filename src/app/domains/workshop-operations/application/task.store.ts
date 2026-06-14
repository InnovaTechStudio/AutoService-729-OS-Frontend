import { Injectable, inject, signal } from '@angular/core';
import { WorkOrderService } from '../infrastructure/services/work-order.service';
import { Task } from '../domain/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private service = inject(WorkOrderService);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal<boolean>(false);

  loadAllTasks(): Promise<void> {
    this.loading.set(true);
    return new Promise((resolve, reject) => {
      this.service.getTasks().subscribe({
        next: (data) => {
          this.tasks.set(data);
          this.loading.set(false);
          resolve();
        },
        error: (err) => {
          console.error('Error fetching tasks', err);
          this.loading.set(false);
          reject(err);
        },
      });
    });
  }

  addTask(task: Task): Promise<Task> {
    return new Promise((resolve, reject) => {
      this.service.createTask(task).subscribe({
        next: (newTask) => {
          this.tasks.update((list) => [...list, newTask]);
          resolve(newTask);
        },
        error: (err) => reject(err),
      });
    });
  }

  updateTask(id: string | number, data: Partial<Task>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.updateTask(id, data).subscribe({
        next: (updated) => {
          this.tasks.update((list) => list.map((t) => (String(t.id) === String(id) ? updated : t)));
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  approveTask(id: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = {
        adminReviewStatus: 'APPROVED',
        customerReportStatus: 'VISIBLE',
      };
      this.service.patchTask(id, payload).subscribe({
        next: (updated) => {
          this.tasks.update((list) => list.map((t) => (String(t.id) === String(id) ? updated : t)));
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  rejectTask(id: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = {
        status: 'IN_PROGRESS',
        adminReviewStatus: 'REJECTED',
      };
      this.service.patchTask(id, payload).subscribe({
        next: (updated) => {
          this.tasks.update((list) => list.map((t) => (String(t.id) === String(id) ? updated : t)));
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  deleteTask(id: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.deleteTask(id).subscribe({
        next: () => {
          this.tasks.update((list) => list.filter((t) => String(t.id) !== String(id)));
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }
}
