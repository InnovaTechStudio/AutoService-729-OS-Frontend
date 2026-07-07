import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { WorkOrder } from '../../domain/models/work-order.model';
import { Task } from '../../domain/models/task.model';

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1`;

  // --- Work Orders ---
  getWorkOrders(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(`${this.apiUrl}/work-orders`);
  }

  getWorkOrderById(id: string | number): Observable<WorkOrder> {
    return this.http.get<WorkOrder>(`${this.apiUrl}/work-orders/${id}`);
  }

  createWorkOrder(data: WorkOrder): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(`${this.apiUrl}/work-orders`, data);
  }

  updateWorkOrder(id: string | number, data: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.http.put<WorkOrder>(`${this.apiUrl}/work-orders/${id}`, data);
  }

  patchWorkOrder(id: string | number, data: { status: string }): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.apiUrl}/work-orders/${id}`, data);
  }

  // --- Tasks ---
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  createTask(data: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, data);
  }

  updateTask(id: string | number, data: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, data);
  }

  deleteTask(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }

  patchTask(id: string | number, data: any): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}`, data);
  }
}
