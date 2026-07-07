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
          const parsedData = data.map((t: any) => {
            let parts = [];
            if (t.internalObservation && t.internalObservation.startsWith('PARTS:')) {
              try {
                parts = JSON.parse(t.internalObservation.substring(6));
              } catch (e) {}
            }
            return { ...t, parts, adminReviewStatus: t.adminReviewStatus || 'PENDING' };
          });
          this.tasks.set(parsedData);
          this.loading.set(false);
          resolve();
        },
        error: (err) => {
          this.loading.set(false);
          reject(err);
        },
      });
    });
  }

  addTask(task: any): Promise<Task> {
    return new Promise((resolve, reject) => {
      const payload = {
        ...task,
        internalObservation: task.parts?.length ? 'PARTS:' + JSON.stringify(task.parts) : '',
      };
      this.service.createTask(payload).subscribe({
        next: (newTask) => {
          const savedTask = { ...newTask, parts: task.parts || [] };
          this.tasks.update((list) => [...list, savedTask]);
          resolve(savedTask);
        },
        error: (err) => reject(err),
      });
    });
  }

  updateTask(id: string | number, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = { ...data };
      if (data.parts?.length) payload.internalObservation = 'PARTS:' + JSON.stringify(data.parts);

      this.service.updateTask(id, payload).subscribe({
        next: (updated) => {
          const savedTask = { ...updated, parts: data.parts || [] };
          this.tasks.update((list) =>
            list.map((t) => (String(t.id) === String(id) ? savedTask : t)),
          );
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

  patchTask(id: string | number, payload: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.patchTask(id, payload).subscribe({
        next: (updated) => {
          this.tasks.update((list) =>
            list.map((t) =>
              String(t.id) === String(id) ? { ...t, ...updated, parts: t.parts } : t,
            ),
          );
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }
}
