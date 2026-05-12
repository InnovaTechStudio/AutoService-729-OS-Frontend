/**
 * WorkOrderService
 * 
 * Service of infrastructure that manages the CRUD operations related
 * to Work Orders and Tasks against the simulated backend (json-server).
 * 
 * @service
 * @providedIn 'root'
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkOrder, Task } from '../../domain/models/work-order.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Gets all work orders.
   */
  getAllOrders() { return this.http.get<WorkOrder[]>(`${this.apiUrl}/work-orders`); }

  /**
   * Creates a new work order.
   * @param data - Data of the order to create
   */
  createOrder(data: WorkOrder) { return this.http.post<WorkOrder>(`${this.apiUrl}/work-orders`, data); }

  /**
   * Updates an existing work order.
   * @param id - ID of the order
   * @param data - Data to update
   */
  updateOrder(id: string, data: Partial<WorkOrder>) { return this.http.put<WorkOrder>(`${this.apiUrl}/work-orders/${id}`, data); }

  /**
   * Gets all registered tasks.
   */
  getAllTasks() {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  /**
   * Gets the tasks associated with a specific work order.
   * @param workOrderId - ID of the work order
   */
  getTasksByOrderId(workOrderId: string) {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks?workOrderId=${workOrderId}`);
  }

  /**
   * Creates a new task.
   * @param data - Data of the task to create
   */
  createTask(data: Task) {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, data);
  }

  /**
   * Updates an existing task.
   * @param id - ID of the task
   * @param data - Data to update
   */
  updateTask(id: string, data: Task) {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, data);
  }

  /**
   * Updates only the status of a task (using PATCH).
   * @param id - ID of the task
   * @param status - New status
   */
  updateTaskStatus(id: string, status: Task['status']) {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}`, { status });
  }

  /**
   * Deletes a task.
   * @param id - ID of the task to delete
   */
  deleteTask(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }
}
