import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkOrder, Task } from '../../domain/models/work-order.model';

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  // Work Orders
  getAllOrders() { return this.http.get<WorkOrder[]>(`${this.apiUrl}/work-orders`); }
  createOrder(data: WorkOrder) { return this.http.post<WorkOrder>(`${this.apiUrl}/work-orders`, data); }
  updateOrder(id: string, data: Partial<WorkOrder>) { return this.http.put<WorkOrder>(`${this.apiUrl}/work-orders/${id}`, data); }

  // Tasks
  // Tasks
  getAllTasks() {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  getTasksByOrderId(workOrderId: string) {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks?workOrderId=${workOrderId}`);
  }

  createTask(data: Task) {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, data);
  }

  updateTask(id: string, data: Task) {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, data);
  }

  updateTaskStatus(id: string, status: Task['status']) {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}`, { status });
  }

  deleteTask(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }
}
