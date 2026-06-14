import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { CustomerStore } from '../../../customer-management/application/customer.store';
import { VehicleStore } from '../../application/vehicle.store';
import { TaskStore } from '../../../workshop-operations/application/task.store';
import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';

const VEHICLE_STATUS = { IN_WORKSHOP: 'IN_WORKSHOP', READY: 'READY', DELIVERED: 'DELIVERED' };
const ORDER_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
  DELIVERED: 'DELIVERED',
};
const TASK_STATUS = { PENDING: 'PENDING', IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED' };

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
  ],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css',
})
export class VehicleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public translate = inject(TranslateService);

  private vehicleStore = inject(VehicleStore);
  private customerStore = inject(CustomerStore);
  private workOrderStore = inject(WorkOrderStore);
  private taskStore = inject(TaskStore);

  vehicleId = this.route.snapshot.paramMap.get('id');

  fallbackVehicleImages = [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop',
  ];

  async ngOnInit() {
    await Promise.all([
      this.vehicleStore.loadVehicles(),
      this.customerStore.loadCustomers(),
      this.workOrderStore.loadWorkOrders(),
      this.taskStore.loadAllTasks(),
    ]);
  }

  vehicle = computed(() =>
    this.vehicleStore.vehicles().find((item) => String(item.id) === String(this.vehicleId)),
  );

  vehicleImage = computed(() => {
    const v = this.vehicle();
    if (!v) return '';
    if (v.image) return v.image;
    const index = this.vehicleStore
      .vehicles()
      .findIndex((item) => String(item.id) === String(this.vehicleId));
    return this.fallbackVehicleImages[index >= 0 ? index % this.fallbackVehicleImages.length : 0];
  });

  owner = computed(() => {
    const v = this.vehicle();
    if (!v) return null;
    return this.customerStore.customers().find((c) => String(c.id) === String(v.customerId));
  });

  relatedOrders = computed(() =>
    this.workOrderStore.workOrders().filter((o) => String(o.vehicleId) === String(this.vehicleId)),
  );
  lastOrder = computed(() =>
    this.relatedOrders().length ? this.relatedOrders()[this.relatedOrders().length - 1] : null,
  );
  relatedTasks = computed(() =>
    this.lastOrder()
      ? this.taskStore.tasks().filter((t) => String(t.workOrderId) === String(this.lastOrder()!.id))
      : [],
  );

  progress = computed(() => {
    if (!this.relatedTasks().length) return this.getProgressByStatus(this.vehicle()?.status);
    const completed = this.relatedTasks().filter((t) => t.status === TASK_STATUS.COMPLETED).length;
    return Math.round((completed / this.relatedTasks().length) * 100);
  });

  getProgressByStatus(status: any): number {
    if (
      [
        VEHICLE_STATUS.READY,
        VEHICLE_STATUS.DELIVERED,
        ORDER_STATUS.FINISHED,
        ORDER_STATUS.DELIVERED,
      ].includes(status)
    )
      return 100;
    if ([VEHICLE_STATUS.IN_WORKSHOP, ORDER_STATUS.IN_PROGRESS].includes(status)) return 65;
    if (status === ORDER_STATUS.PENDING) return 15;
    return 0;
  }

  getVehicleSeverity(status: any): string {
    if (
      [
        VEHICLE_STATUS.READY,
        VEHICLE_STATUS.DELIVERED,
        ORDER_STATUS.FINISHED,
        ORDER_STATUS.DELIVERED,
      ].includes(status)
    )
      return 'badge-success';
    if ([VEHICLE_STATUS.IN_WORKSHOP, ORDER_STATUS.IN_PROGRESS].includes(status))
      return 'badge-info';
    if (status === ORDER_STATUS.PENDING) return 'badge-warning';
    return 'badge-secondary';
  }

  getTaskSeverity(status: any): string {
    if (status === TASK_STATUS.COMPLETED) return 'badge-success';
    if (status === TASK_STATUS.IN_PROGRESS) return 'badge-info';
    if (status === TASK_STATUS.PENDING) return 'badge-warning';
    return 'badge-secondary';
  }

  getStatusLabel(status: any, prefix = 'vehicles.statusOptions'): string {
    if (!status) return '';
    const key = String(status).toLowerCase();
    return this.translate.instant(`${prefix}.${key}`);
  }

  goBack() {
    this.router.navigate(['/vehicles']);
  }
  goToOrder(orderId: string | number | undefined) {
    if (orderId) this.router.navigate([`/work-orders/${orderId}`]);
  }
}
