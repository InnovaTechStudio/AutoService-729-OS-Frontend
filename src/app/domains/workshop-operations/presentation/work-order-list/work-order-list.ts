/**
 * WorkOrderListComponent
 *
 * Main component responsible for displaying all work orders in the workshop.
 * It provides search and status filtering, summary statistics, delay-risk
 * detection and navigation to create or view work order details.
 *
 * The component uses Angular Signals and computed values to keep the
 * work order list, filters and derived metrics updated reactively.
 *
 * @component
 * @selector app-work-order-list
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TranslateModule,
    WorkOrderCardComponent,
    WorkOrderFiltersComponent
  ],
  templateUrl: './work-order-list.html',
  styleUrl: './work-order-list.css'
})
export class WorkOrderListComponent implements OnInit {

  /**
   * Store responsible for managing work orders.
   */
  protected readonly workOrderStore = inject(WorkOrderStore);

  /**
   * Store responsible for managing vehicles.
   */
  protected readonly vehicleStore = inject(VehicleStore);

  /**
   * Store responsible for managing customers.
   */
  protected readonly customerStore = inject(CustomerStore);

  /**
   * Store responsible for managing tasks.
   */
  protected readonly taskStore = inject(TaskStore);

  /**
   * Router used for navigation.
   */
  private readonly router = inject(Router);

  /**
   * Translation service used for TypeScript-generated labels.
   */
  private readonly translate = inject(TranslateService);

  /**
   * Current search term used to filter work orders.
   */
  protected readonly search = signal('');

  /**
   * Selected work order status used by the status filter.
   */
  protected readonly selectedStatus = signal<WorkOrder['status'] | null>(null);

  /**
   * Available work order status options.
   */
  protected readonly statusOptions: WorkOrder['status'][] = [
    'Pendiente',
    'En Proceso',
    'Finalizado',
    'Cancelado'
  ];

  /**
   * Enriched work order view models displayed in work order cards.
   */
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

  /**
   * Filtered work order list based on search term and selected status.
   */
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

  /**
   * Number of active work orders.
   */
  protected readonly activeOrders = computed(() =>
    this.workOrderStore.workOrders().filter((order) => order.status === 'En Proceso').length
  );

  /**
   * Number of completed work orders.
   */
  protected readonly completedOrders = computed(() =>
    this.workOrderStore.workOrders().filter((order) => order.status === 'Finalizado').length
  );

  /**
   * Number of work orders with delay risk.
   */
  protected readonly riskOrders = computed(() =>
    this.ordersView().filter((order) => order.isRisk).length
  );

  /**
   * Loads work orders and their related vehicles, customers and tasks.
   */
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

  /**
   * Updates the search term used by the filter.
   *
   * @param value New search text.
   */
  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  /**
   * Updates the selected work order status filter.
   *
   * @param value Selected status or null to show all statuses.
   */
  protected onStatusChange(value: WorkOrder['status'] | null): void {
    this.selectedStatus.set(value);
  }

  /**
   * Navigates to the work order creation page.
   */
  protected goToCreateOrder(): void {
    this.router.navigate(['/admin/work-orders/new']);
  }

  /**
   * Navigates to the selected work order detail page.
   *
   * @param order Selected work order.
   */
  protected viewDetail(order: WorkOrder): void {
    this.router.navigate(['/admin/work-orders', order.id]);
  }

  /**
   * Gets the vehicle plate by vehicle ID.
   *
   * @param vehicleId Vehicle identifier.
   * @returns Vehicle plate or fallback value.
   */
  private getVehiclePlate(vehicleId: string): string {
    return this.vehicleStore
      .vehicles()
      .find((vehicle) => String(vehicle.id) === String(vehicleId))
      ?.plate ?? '---';
  }

  /**
   * Gets the vehicle name by vehicle ID.
   *
   * @param vehicleId Vehicle identifier.
   * @returns Vehicle display name or translated fallback.
   */
  private getVehicleName(vehicleId: string): string {
    const vehicle = this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(vehicleId));

    return vehicle
      ? `${vehicle.brand || this.translate.instant('WORK_ORDER_LIST.DEFAULT_VEHICLE')} ${vehicle.model || ''} - ${vehicle.plate}`
      : this.translate.instant('WORK_ORDER_LIST.VEHICLE_NOT_FOUND');
  }

  /**
   * Gets the customer name by customer ID.
   *
   * @param customerId Customer identifier.
   * @returns Customer full name or translated fallback.
   */
  private getCustomerName(customerId: string): string {
    const customer = this.customerStore
      .customers()
      .find((item) => String(item.id) === String(customerId));

    return customer?.fullName ?? this.translate.instant('WORK_ORDER_LIST.USER_NOT_FOUND');
  }

  /**
   * Calculates the progress of a work order based on completed tasks.
   *
   * @param orderId Work order identifier.
   * @returns Progress percentage.
   */
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

  /**
   * Checks whether a work order has delay risk.
   *
   * @param order Work order to evaluate.
   * @returns True if the order is at risk or delayed.
   */
  private isRiskOrder(order: WorkOrder): boolean {
    const riskStatus = this.getDelayRiskStatus(order);

    return riskStatus === 'En riesgo' || riskStatus === 'Retrasada';
  }

  /**
   * Gets the delay risk status for a work order.
   *
   * @param order Work order to evaluate.
   * @returns Internal delay risk status.
   */
  private getDelayRiskStatus(
    order: WorkOrder
  ): 'A tiempo' | 'En riesgo' | 'Retrasada' | 'Completada' | 'Cancelada' {

    if (order.status === 'Finalizado') {
      return 'Completada';
    }

    if (order.status === 'Cancelado') {
      return 'Cancelada';
    }

    const progress = this.calculateProgress(String(order.id));
    const today = new Date();
    const estimatedDate = order.estimatedDate
      ? new Date(order.estimatedDate)
      : null;

    if (estimatedDate && estimatedDate < today) {
      return 'Retrasada';
    }

    if (order.status === 'En Proceso' && progress < 50) {
      return 'En riesgo';
    }

    return 'A tiempo';
  }

  /**
   * Gets the CSS class used to display the delay risk status.
   *
   * @param order Work order to evaluate.
   * @returns CSS class for the risk status.
   */
  private getDelayRiskClass(order: WorkOrder): string {
    const status = this.getDelayRiskStatus(order);

    if (status === 'Completada') return 'risk-success';
    if (status === 'Cancelada') return 'risk-secondary';
    if (status === 'Retrasada') return 'risk-danger';
    if (status === 'En riesgo') return 'risk-warning';

    return 'risk-ok';
  }
}