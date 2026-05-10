import { Injectable, inject, signal } from '@angular/core';
import { WorkOrderService } from '../infrastructure/services/work-order.service';
import { WorkOrder } from '../domain/models/work-order.model';

@Injectable({ providedIn: 'root' })
export class WorkOrderStore {
  private service = inject(WorkOrderService);

  readonly workOrders = signal<WorkOrder[]>([]);
  readonly isLoading = signal<boolean>(false);

  loadWorkOrders() {
    this.isLoading.set(true);
    this.service.getAllOrders().subscribe({
      next: (data) => { this.workOrders.set(data); this.isLoading.set(false); },
      error: (err) => { console.error('Error cargando órdenes:', err); this.isLoading.set(false); }
    });
  }

  addWorkOrder(order: WorkOrder) {
    // Retornamos el observable para poder usar el ID de la orden creada al crear tareas
    return this.service.createOrder(order);
  }

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
