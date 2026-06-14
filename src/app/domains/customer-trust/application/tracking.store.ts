import { Injectable, inject, signal } from '@angular/core';
import { TrackingService } from '../infrastructure/services/tracking.service';

@Injectable({ providedIn: 'root' })
export class TrackingStore {
  private service = inject(TrackingService);

  readonly order = signal<any | null>(null);
  readonly vehicle = signal<any | null>(null);
  readonly tasks = signal<any[]>([]);
  readonly customer = signal<any | null>(null);
  readonly workshop = signal<any | null>(null);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  async searchOrder(trackingCode: string): Promise<void> {
    if (!trackingCode) return;

    this.loading.set(true);
    this.error.set(null);
    this.clearData();

    try {
      const orders = await this.service.getOrderByCode(trackingCode).toPromise();
      if (!orders || orders.length === 0) {
        this.error.set('tracking.errors.notFound');
        this.loading.set(false);
        return;
      }

      const foundOrder = orders[0];
      this.order.set(foundOrder);

      const [tasksRes, vehicleRes, workshopRes] = await Promise.all([
        this.service.getTasksByOrder(foundOrder.id).toPromise(),
        this.service.getVehicle(foundOrder.vehicleId).toPromise(),
        this.service
          .getWorkshop(foundOrder.workshopId || 1)
          .toPromise()
          .catch(() => null),
      ]);

      this.tasks.set(tasksRes || []);
      this.vehicle.set(vehicleRes || null);
      this.workshop.set(workshopRes || null);

      if (vehicleRes?.customerId) {
        const customerRes = await this.service.getCustomer(vehicleRes.customerId).toPromise();
        this.customer.set(customerRes || null);
      }

      this.loading.set(false);
    } catch (err) {
      console.error(err);
      this.error.set('tracking.errors.serverError');
      this.loading.set(false);
    }
  }

  async processPayment(): Promise<void> {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.loading.set(true);
    try {
      await this.service.processPayment(currentOrder.id).toPromise();
      this.order.update((o) => ({ ...o, status: 'DELIVERED' }));
      this.loading.set(false);
    } catch (err) {
      console.error(err);
      this.error.set('tracking.errors.paymentFailed');
      this.loading.set(false);
      throw err;
    }
  }

  clearData() {
    this.order.set(null);
    this.vehicle.set(null);
    this.tasks.set([]);
    this.customer.set(null);
    this.workshop.set(null);
  }
}
