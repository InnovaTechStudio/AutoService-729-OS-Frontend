/**
 * TrackingStore
 * 
 * Signals-based reactive store that manages tracking status
 * Work order tracking. Allows you to search for an order by code.
 * and load its related information (vehicle and tasks).
 * 
 * @service
 * @providedIn 'root'
 */

import { Injectable, inject, signal } from '@angular/core';
import { TrackingService } from '../infrastructure/services/tracking.service';
import { WorkOrder, Task } from '../../workshop-operations/domain/models/work-order.model';
import { Vehicle } from '../../fleet-management/domain/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class TrackingStore {
  private trackingService = inject(TrackingService);

  /** Current work order loaded */
  readonly order = signal<WorkOrder | null>(null);
  /** Vehicle associated with the current order */
  readonly vehicle = signal<Vehicle | null>(null);
  /** List of tasks for the current order */
  readonly tasks = signal<Task[]>([]);
  /** Indicates if a search is in progress */
  readonly isLoading = signal<boolean>(false);
  /** Error message in case of search failure */
  readonly error = signal<string>('');

  /**
   * Searches for a work order by its tracking code.
   * 
   * @param code - Tracking code of the order (converted to uppercase)
   */
  searchOrder(code: string) {
    this.isLoading.set(true);
    this.error.set('');

    this.trackingService.getOrderByCode(code.trim().toUpperCase()).subscribe({
      next: (orders) => {
        if (orders.length > 0) {
          const order = orders[0];
          this.order.set(order);

          /** Parallel loading of related data */
          this.trackingService.getVehicle(order.vehicleId).subscribe(v => this.vehicle.set(v));
          this.trackingService.getTasks(order.id!).subscribe(t => this.tasks.set(t));

          this.isLoading.set(false);
        } else {
          this.error.set('Código no encontrado.');
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.error.set('Error de conexión con el servidor.');
        this.isLoading.set(false);
      }
    });
  }
}
