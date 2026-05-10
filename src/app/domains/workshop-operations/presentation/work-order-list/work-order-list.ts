import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

import { WorkOrderStore } from '../../application/work-order.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { CustomerStore } from '../../../customer-management/application/customer.store';
import { WorkOrder } from '../../domain/models/work-order.model';

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatChipsModule
  ],
  templateUrl: './work-order-list.html',
  styleUrl: './work-order-list.css'
})
export class WorkOrderListComponent implements OnInit {
  workOrderStore = inject(WorkOrderStore);
  vehicleStore = inject(VehicleStore);
  customerStore = inject(CustomerStore);
  router = inject(Router);

  displayedColumns: string[] = [
    'trackingCode', 'vehicle', 'customer', 'progress',
    'startDate', 'estimatedDate', 'status', 'actions'
  ];

  ngOnInit() {
    this.workOrderStore.loadWorkOrders();
    // Cargamos dependencias si están vacías
    if (this.vehicleStore.vehicles().length === 0) this.vehicleStore.loadVehicles();
    if (this.customerStore.customers().length === 0) this.customerStore.loadCustomers();
  }

  getVehiclePlate(id: string): string {
    const vehicle = this.vehicleStore.vehicles().find(v => String(v.id) === String(id));
    return vehicle?.plate || '---';
  }

  getCustomerName(id: string): string {
    if (!id) return '---';
    const customer = this.customerStore.customers().find(c => String(c.id) === String(id));
    return customer ? customer.fullName : 'Cliente no encontrado';
  }

  // Mantenemos tu lógica original que retorna 0 por ahora [cite: 297]
  calculateProgress(orderId: string | undefined): number {
    return 0;
  }

  viewDetail(order: WorkOrder) {
    this.router.navigate(['/admin/work-orders', order.id]);
  }

  goToNewOrder() {
    this.router.navigate(['/admin/work-orders/new']);
  }
}
