import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { WorkOrderStore } from '../../application/work-order.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { CustomerStore } from '../../../customer-management/application/customer.store';

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatButtonToggleModule,
    TranslatePipe,
  ],
  templateUrl: './work-order-list.html',
  styleUrl: './work-order-list.css',
})
export class WorkOrderListComponent implements OnInit {
  private router = inject(Router);
  public translate = inject(TranslateService);

  public workOrderStore = inject(WorkOrderStore);
  private vehicleStore = inject(VehicleStore);
  private customerStore = inject(CustomerStore);

  viewMode = signal<'kanban' | 'list'>('kanban');
  searchQuery = signal('');

  columns = [
    { id: 'PENDING', title: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
    { id: 'IN_PROGRESS', title: 'En Proceso', color: '#3b82f6', bg: '#dbeafe' },
    { id: 'FINISHED', title: 'Finalizado', color: '#10b981', bg: '#d1fae5' },
    { id: 'DELIVERED', title: 'Entregado', color: '#64748b', bg: '#e2e8f0' },
  ];

  async ngOnInit() {
    await Promise.all([
      this.workOrderStore.loadWorkOrders(),
      this.vehicleStore.loadVehicles(),
      this.customerStore.loadCustomers(),
    ]);
  }

  mappedOrders = computed(() => {
    const term = this.searchQuery().toLowerCase();

    return this.workOrderStore
      .workOrders()
      .map((order) => {
        const vehicle = this.vehicleStore
          .vehicles()
          .find((v) => String(v.id) === String(order.vehicleId));
        const customer = this.customerStore
          .customers()
          .find((c) => String(c.id) === String(vehicle?.customerId));

        return {
          ...order,
          vehiclePlate: vehicle?.plate || 'N/A',
          vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo Desconocido',
          customerName: customer?.fullName || 'Sin Asignar',
        };
      })
      .filter(
        (order) =>
          !term ||
          order.trackingCode?.toLowerCase().includes(term) ||
          order.vehiclePlate.toLowerCase().includes(term) ||
          order.customerName.toLowerCase().includes(term),
      );
  });

  getOrdersByStatus(statusId: string) {
    return this.mappedOrders().filter((o) => o.status === statusId);
  }

  getSeverityClass(status: string): string {
    if (status === 'FINISHED' || status === 'DELIVERED') return 'badge-success';
    if (status === 'IN_PROGRESS') return 'badge-info';
    return 'badge-warning';
  }

  getStatusLabel(status: string): string {
    const found = this.columns.find((c) => c.id === status);
    return found ? found.title : status;
  }

  goToCreate() {
    this.router.navigate(['/work-orders/new']);
  }

  goToDetail(id: string | number | undefined) {
    if (id) this.router.navigate([`/work-orders/${id}`]);
  }
}
