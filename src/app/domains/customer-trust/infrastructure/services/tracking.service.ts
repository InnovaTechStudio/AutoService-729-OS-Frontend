import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { WorkOrder, Task } from '../../../workshop-operations/domain/models/work-order.model';
import { Vehicle } from '../../../fleet-management/domain/models/vehicle.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getOrderByCode(trackingCode: string) {
    return this.http.get<WorkOrder[]>(`${this.apiUrl}/work-orders?trackingCode=${trackingCode}`);
  }

  getVehicle(vehicleId: string) {
    return this.http.get<Vehicle>(`${this.apiUrl}/vehicles/${vehicleId}`);
  }

  getTasks(workOrderId: string) {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks?workOrderId=${workOrderId}`).pipe(
      map(tasks => tasks.filter(task => String(task.workOrderId) === String(workOrderId)))
    );
  }
}
