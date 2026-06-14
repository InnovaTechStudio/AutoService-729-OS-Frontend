import { Injectable, inject, signal } from '@angular/core';
import { WorkOrderService } from '../infrastructure/services/work-order.service';
import { WorkOrder } from '../domain/models/work-order.model';

@Injectable({ providedIn: 'root' })
export class WorkOrderStore {
  private service = inject(WorkOrderService);

  readonly workOrders = signal<WorkOrder[]>([]);
  readonly loading = signal<boolean>(false);

  loadWorkOrders(): Promise<void> {
    this.loading.set(true);
    return new Promise((resolve, reject) => {
      this.service.getWorkOrders().subscribe({
        next: (data) => {
          this.workOrders.set(data);
          this.loading.set(false);
          resolve();
        },
        error: (err) => {
          console.error('Error fetching work orders', err);
          this.loading.set(false);
          reject(err);
        },
      });
    });
  }

  addWorkOrder(order: WorkOrder): Promise<WorkOrder> {
    return new Promise((resolve, reject) => {
      this.service.createWorkOrder(order).subscribe({
        next: (newOrder) => {
          this.workOrders.update((list) => [...list, newOrder]);
          resolve(newOrder);
        },
        error: (err) => reject(err),
      });
    });
  }

  updateWorkOrder(id: string | number, data: Partial<WorkOrder>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.updateWorkOrder(id, data).subscribe({
        next: (updated) => {
          this.workOrders.update((list) =>
            list.map((o) => (String(o.id) === String(id) ? updated : o)),
          );
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  updateOrderAutoPrice(id: string | number, calculatedTotal: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingOrder = this.workOrders().find((o) => String(o.id) === String(id));
      if (!existingOrder) return reject('Order not found');

      let newStatus = existingOrder.status;
      if (newStatus === 'PENDING') newStatus = 'IN_PROGRESS';

      const payload = {
        description: existingOrder.description || 'Sin descripción', // <-- AGREGAR ESTA LÍNEA
        estimatedDate: existingOrder.estimatedDate,
        price: parseFloat(String(calculatedTotal)),
        status: newStatus,
        tasksCompleted: (existingOrder as any).qaChecklist?.tasksCompleted || false,
        sparePartsChecked: (existingOrder as any).qaChecklist?.sparePartsChecked || false,
        diagnosisValidated: (existingOrder as any).qaChecklist?.diagnosisValidated || false,
        cleaningDone: (existingOrder as any).qaChecklist?.cleaningDone || false,
        finalTestDone: (existingOrder as any).qaChecklist?.finalTestDone || false,
      };

      this.service.updateWorkOrder(id, payload).subscribe({
        next: (updated) => {
          this.workOrders.update((list) =>
            list.map((o) => (String(o.id) === String(id) ? updated : o)),
          );
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  updateWorkOrderChecklist(id: string | number, updateData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = {
        description: updateData.description || 'Sin descripción', // <-- AGREGAR ESTA LÍNEA
        estimatedDate: updateData.estimatedDate,
        price: updateData.price,
        status: updateData.status,
        tasksCompleted: updateData.qaChecklist?.tasksCompleted || false,
        sparePartsChecked: updateData.qaChecklist?.sparePartsChecked || false,
        diagnosisValidated: updateData.qaChecklist?.diagnosisValidated || false,
        cleaningDone: updateData.qaChecklist?.cleaningDone || false,
        finalTestDone: updateData.qaChecklist?.finalTestDone || false,
      };

      this.service.updateWorkOrder(id, payload).subscribe({
        next: (updated) => {
          this.workOrders.update((list) =>
            list.map((o) => (String(o.id) === String(id) ? updated : o)),
          );
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }
}
