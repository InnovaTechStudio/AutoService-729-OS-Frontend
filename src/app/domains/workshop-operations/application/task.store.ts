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
      },
    });
  }
  private readonly taskImages: string[] = [
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1200',
    'data:image/webp;base64,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',
    'https://tse4.mm.bing.net/th/id/OIP.MUG4eb_nr7SYtPK9VPC5pAHaEN?cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://thf.bing.com/th/id/OIP.EJTv5khzoAXpfvXluJ0FPAAAAA?w=281&h=186&c=7&r=0&o=7&cb=thfc1&pid=1.7&rm=3',
    'https://thf.bing.com/th/id/OIP.pm28Y9jv_PPRf6KaVIDtBgHaDP?w=314&h=153&c=7&r=0&o=7&cb=thfc1&pid=1.7&rm=3',
    'https://thf.bing.com/th/id/OIP.gzgQSpLpj9nMwAnPqwg-YQHaEk?w=283&h=180&c=7&r=0&o=7&cb=thfc1&pid=1.7&rm=3',
  ];

  /**
   * Adds a new task.
   * @param task - Data of the task to create
   */
  addTask(task: Task): void {
    const randomImage = this.taskImages[Math.floor(Math.random() * this.taskImages.length)];
    const newTask: Task = {
      ...task,
      photo: randomImage,
    };
    this.service.createTask(newTask).subscribe({
      next: (createdTask) => {
        this.tasks.update((list) => [...list, createdTask]);
      },
      error: (err) => console.error('Error creando tarea:', err),
    });
  }

  /**
   * Updates a task completely.
   */
  updateTask(id: string, task: Task): void {
    this.service.updateTask(id, task).subscribe({
      next: (updatedTask) => {
        this.tasks.update((list) =>
          list.map((item) => (String(item.id) === String(id) ? updatedTask : item)),
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
          list.map((item) => (String(item.id) === String(id) ? updatedTask : item)),
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
        this.tasks.update((list) => list.filter((item) => String(item.id) !== String(id)));
      },
      error: (err) => console.error('Error eliminando tarea:', err),
    });
  }
  /**
   * Updates the mechanic technical report fields for a task.
   * This simulates the communication from Mechanic to Administrator and Client.
   */
  updateMechanicTechnicalReport(id: string, task: Task): void {
    const updatedTask: Task = {
      ...task,
      adminReviewStatus: 'Enviado al Administrador'
    };

    this.service.updateTask(id, updatedTask).subscribe({
      next: (savedTask) => {
        this.tasks.update((list) =>
          list.map((item) =>
            String(item.id) === String(id) ? savedTask : item
          )
        );
      },
      error: (err) => console.error('Error updating mechanic report:', err)
    });
  }

  /**
   * Marks a task as completed by the mechanic and makes the customer explanation visible.
   */
  completeTaskFromMechanic(id: string, task: Task): void {
    const completedTask: Task = {
      ...task,
      status: 'Completada',
      adminReviewStatus: 'Enviado al Administrador',
      customerReportStatus: 'Visible para Cliente',
      completedAt: new Date().toLocaleString('es-PE')
    };

    this.service.updateTask(id, completedTask).subscribe({
      next: (savedTask) => {
        this.tasks.update((list) =>
          list.map((item) =>
            String(item.id) === String(id) ? savedTask : item
          )
        );
      },
      error: (err) => console.error('Error completing mechanic task:', err)
    });
  }

}
