/**
 * TrackingService
 * 
 * Infrastructure service responsible for querying the information
 * of work order tracking from the backend (json-server).
 * 
 * @service
 * @providedIn 'root'
 */

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

  /**
   * Searches for a work order by its tracking code.
   * 
   * @param trackingCode - Unique code of the order
   * @returns Observable with an array of WorkOrder (usually 0 or 1 result)
   */
  getOrderByCode(trackingCode: string) {
    return this.http.get<WorkOrder[]>(`${this.apiUrl}/work-orders?trackingCode=${trackingCode}`);
  }

  /**
   * Gets the information of a vehicle by its ID.
   * 
   * @param vehicleId - ID of the vehicle
   * @returns Observable with the requested Vehicle
   */
  getVehicle(vehicleId: string) {
    return this.http.get<Vehicle>(`${this.apiUrl}/vehicles/${vehicleId}`);
  }

  /**
   * Gets the tasks associated with a work order.
   * 
   * @param workOrderId - ID of the work order
   * @returns Observable with the filtered tasks
   */
  getTasks(workOrderId: string) {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks?workOrderId=${workOrderId}`).pipe(
      map(tasks => tasks.filter(task => String(task.workOrderId) === String(workOrderId)))
    );
  }
}
