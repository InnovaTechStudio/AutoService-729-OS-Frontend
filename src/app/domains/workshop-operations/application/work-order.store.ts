/**
 * WorkOrderStore
 * 
 * Reactive store that manages the status of Work Orders.
 * 
 * @service
 * @providedIn 'root'
 */
import { Injectable, inject, signal } from '@angular/core';
import { WorkOrderService } from '../infrastructure/services/work-order.service';
import { WorkOrder } from '../domain/models/work-order.model';

@Injectable({ providedIn: 'root' })
export class WorkOrderStore {
  private service = inject(WorkOrderService);

  /** Reactive list of all work orders */
  readonly workOrders = signal<WorkOrder[]>([]);

  /** Indicates if information is being loaded */
  readonly isLoading = signal<boolean>(false);

  /**
   * Loads all work orders from the backend.
   */
  loadWorkOrders() {
    this.isLoading.set(true);
    this.service.getAllOrders().subscribe({
      next: (data) => { this.workOrders.set(data); this.isLoading.set(false); },
      error: (err) => { console.error('Error cargando órdenes:', err); this.isLoading.set(false); }
    });
  }

  /**
   * Creates a new work order.
   * @returns Observable with the created order (useful for obtaining the ID)
   */
  addWorkOrder(order: WorkOrder) {
    // Return the observable to be able to use the ID of the created order when creating tasks
    return this.service.createOrder(order);
  }

  /**
   * Updates an existing work order.
   */
  updateWorkOrder(id: string, data: Partial<WorkOrder>) {
    return this.service.updateOrder(id, data).subscribe({
      next: (updatedOrder) => {
        this.workOrders.update(list => {
          const index = list.findIndex(wo => String(wo.id) === String(id));
          if (index !== -1) {
            const newList = [...list];
            newList[index] = updatedOrder;
            return newList;
          }
          return list;
        });
      },
      error: (err) => console.error('Error actualizando orden:', err)
    });
  }
}
