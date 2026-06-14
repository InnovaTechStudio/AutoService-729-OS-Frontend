import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1`;

  getOrderByCode(trackingCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/work-orders?trackingCode=${trackingCode}`);
  }

  getVehicle(vehicleId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vehicles/${vehicleId}`);
  }

  getTasksByOrder(workOrderId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks?workOrderId=${workOrderId}`);
  }

  getCustomer(customerId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customers/${customerId}`);
  }

  getWorkshop(workshopId: string | number): Observable<any> {
    // Si la API es diferente, ajústalo. Asumimos plural 'workshops'
    return this.http.get<any>(`${this.apiUrl}/workshops/${workshopId}`);
  }

  processPayment(workOrderId: string | number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/work-orders/${workOrderId}`, {
      status: 'DELIVERED',
    });
  }
}
