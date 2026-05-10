import { Injectable, inject, signal } from '@angular/core';
import { TrackingService } from '../infrastructure/services/tracking.service';
import { WorkOrder, Task } from '../../workshop-operations/domain/models/work-order.model';
import { Vehicle } from '../../fleet-management/domain/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class TrackingStore {
  private trackingService = inject(TrackingService);

  readonly order = signal<WorkOrder | null>(null);
  readonly vehicle = signal<Vehicle | null>(null);
  readonly tasks = signal<Task[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string>('');

  searchOrder(code: string) {
    this.isLoading.set(true);
    this.error.set('');

    this.trackingService.getOrderByCode(code.trim().toUpperCase()).subscribe({
      next: (orders) => {
        if (orders.length > 0) {
          const order = orders[0];
          this.order.set(order);

          // Cargar datos complementarios
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
