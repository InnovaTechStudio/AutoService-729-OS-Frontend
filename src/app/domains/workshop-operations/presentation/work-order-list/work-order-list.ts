import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CustomerStore } from '../../../customer-management/application/customer.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { TaskStore } from '../../application/task.store';
import { WorkOrderStore } from '../../application/work-order.store';
import { WorkOrder } from '../../domain/models/work-order.model';
import { WorkOrderCardComponent, WorkOrderCardView } from './components/work-order-card/work-order-card';
import { WorkOrderFiltersComponent } from './components/work-order-filters/work-order-filters';

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    WorkOrderCardComponent,
    WorkOrderFiltersComponent
  ],
  templateUrl: './work-order-list.html',
  styleUrl: './work-order-list.css'
})
export class WorkOrderListComponent implements OnInit {
  protected readonly workOrderStore = inject(WorkOrderStore);
  protected readonly vehicleStore = inject(VehicleStore);
  protected readonly customerStore = inject(CustomerStore);
  protected readonly taskStore = inject(TaskStore);
  private readonly router = inject(Router);

  protected readonly search = signal('');
  protected readonly selectedStatus = signal<WorkOrder['status'] | null>(null);

  protected readonly statusOptions: WorkOrder['status'][] = [
    'Pendiente',
    'En Proceso',
    'Finalizado',
    'Cancelado'
  ];
  protected readonly ordersView = computed<WorkOrderCardView[]>(() =>
    this.workOrderStore.workOrders().map((order) => ({
      id: String(order.id),
      raw: order,
      trackingCode: order.trackingCode || `WO-${order.id}`,
      vehicleName: this.getVehicleName(order.vehicleId),
      plateOnly: this.getVehiclePlate(order.vehicleId),
      customerName: this.getCustomerName(order.customerId),
      progress: this.calculateProgress(String(order.id)),
      startDate: order.startDate,
      estimatedDate: order.estimatedDate,
      status: order.status,
      price: Number(order.price || 0),
      riskStatus: this.getDelayRiskStatus(order),
      riskClass: this.getDelayRiskClass(order),
      isRisk: this.isRiskOrder(order)
    }))
  );

  protected readonly filteredOrders = computed(() => {
    const term = this.search().toLowerCase().trim();
    const selectedStatus = this.selectedStatus();

    return this.ordersView().filter((order) => {
      const matchesSearch =
        !term ||
        order.trackingCode.toLowerCase().includes(term) ||
        order.vehicleName.toLowerCase().includes(term) ||
        order.plateOnly.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term);

      const matchesStatus =
        !selectedStatus || order.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  });

  protected readonly activeOrders = computed(() =>
    this.workOrderStore.workOrders().filter((order) => order.status === 'En Proceso').length
  );

  protected readonly completedOrders = computed(() =>
    this.workOrderStore.workOrders().filter((order) => order.status === 'Finalizado').length
  );

  protected readonly riskOrders = computed(() =>
    this.ordersView().filter((order) => order.isRisk).length
  );

  ngOnInit(): void {
    this.workOrderStore.loadWorkOrders();

    if (this.vehicleStore.vehicles().length === 0) {
      this.vehicleStore.loadVehicles();
    }

    if (this.customerStore.customers().length === 0) {
      this.customerStore.loadCustomers();
    }

    if (this.taskStore.tasks().length === 0) {
      this.taskStore.loadAllTasks();
    }
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  protected onStatusChange(value: WorkOrder['status'] | null): void {
    this.selectedStatus.set(value);
  }

  protected goToCreateOrder(): void {
    this.router.navigate(['/admin/work-orders/new']);
  }

  protected viewDetail(order: WorkOrder): void {
    this.router.navigate(['/admin/work-orders', order.id]);
  }

  private getVehiclePlate(vehicleId: string): string {
    return this.vehicleStore
      .vehicles()
      .find((vehicle) => String(vehicle.id) === String(vehicleId))
      ?.plate ?? '---';
  }

  private getVehicleName(vehicleId: string): string {
    const vehicle = this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(vehicleId));

    return vehicle
      ? `${vehicle.brand || 'Vehículo'} ${vehicle.model || ''} - ${vehicle.plate}`
      : 'Vehículo no encontrado';
  }

  private getCustomerName(customerId: string): string {
    const customer = this.customerStore
      .customers()
      .find((item) => String(item.id) === String(customerId));

    return customer?.fullName ?? 'Usuario no encontrado';
  }

  private calculateProgress(orderId: string): number {
    const tasks = this.taskStore
      .tasks()
      .filter((task) => String(task.workOrderId) === String(orderId));

    if (!tasks.length) {
      return 0;
    }

    const completed = tasks.filter((task) => task.status === 'Completada').length;

    return Math.round((completed / tasks.length) * 100);
  }


  private isRiskOrder(order: WorkOrder): boolean {
    const riskStatus = this.getDelayRiskStatus(order);
    return riskStatus === 'En riesgo' || riskStatus === 'Retrasada';
  }


  private getDelayRiskStatus(order: WorkOrder): 'A tiempo' | 'En riesgo' | 'Retrasada' | 'Completada' | 'Cancelada' {
    if (order.status === 'Finalizado') {
      return 'Completada';
    }

    if (order.status === 'Cancelado') {
      return 'Cancelada';
    }

    const progress = this.calculateProgress(String(order.id));
    const today = new Date();
    const estimatedDate = order.estimatedDate ? new Date(order.estimatedDate) : null;

    if (estimatedDate && estimatedDate < today) {
      return 'Retrasada';
    }

    if (order.status === 'En Proceso' && progress < 50) {
      return 'En riesgo';
    }

    return 'A tiempo';
  }
  private getDelayRiskClass(order: WorkOrder): string {
    const status = this.getDelayRiskStatus(order);

    if (status === 'Completada') return 'risk-success';
    if (status === 'Cancelada') return 'risk-secondary';
    if (status === 'Retrasada') return 'risk-danger';
    if (status === 'En riesgo') return 'risk-warning';

    return 'risk-ok';
  }


}

