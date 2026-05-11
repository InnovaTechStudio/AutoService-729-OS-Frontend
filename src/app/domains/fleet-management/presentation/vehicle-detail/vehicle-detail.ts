import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CustomerStore } from '../../../customer-management/application/customer.store';
import { Vehicle } from '../../domain/models/vehicle.model';
import { VehicleStore } from '../../application/vehicle.store';
import { TaskStore } from '../../../workshop-operations/application/task.store';
import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';
import { Task, WorkOrder } from '../../../workshop-operations/domain/models/work-order.model';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css'
})
export class VehicleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly vehicleStore = inject(VehicleStore);
  private readonly customerStore = inject(CustomerStore);
  private readonly workOrderStore = inject(WorkOrderStore);
  private readonly taskStore = inject(TaskStore);

  protected readonly vehicleId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly vehicle = computed<Vehicle | undefined>(() =>
    this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(this.vehicleId))
  );

  protected readonly ownerName = computed(() => {
    const currentVehicle = this.vehicle();

    if (!currentVehicle) {
      return 'No asignado';
    }

    const customer = this.customerStore
      .customers()
      .find((item) => String(item.id) === String(currentVehicle.customerId));

    return customer?.fullName ?? 'No asignado';
  });

  protected readonly activeWorkOrder = computed<WorkOrder | undefined>(() => {
    const currentVehicle = this.vehicle();

    if (!currentVehicle) {
      return undefined;
    }

    return this.workOrderStore
      .workOrders()
      .find((order) => String(order.vehicleId) === String(currentVehicle.id));
  });

  protected readonly vehicleTasks = computed<Task[]>(() => {
    const currentOrder = this.activeWorkOrder();

    if (!currentOrder) {
      return [];
    }

    return this.taskStore
      .tasks()
      .filter((task) => String(task.workOrderId) === String(currentOrder.id));
  });

  protected readonly completedTasks = computed(() =>
    this.vehicleTasks().filter((task) => task.status === 'Completada').length
  );

  protected readonly progress = computed(() => {
    const tasks = this.vehicleTasks();

    if (tasks.length > 0) {
      return Math.round((this.completedTasks() / tasks.length) * 100);
    }

    const currentVehicle = this.vehicle();

    if (!currentVehicle) {
      return 0;
    }

    if (currentVehicle.status === 'Listo' || currentVehicle.status === 'Entregado') {
      return 100;
    }

    return currentVehicle.status === 'En Taller' ? 65 : 10;
  });

  protected readonly problemReported = computed(() =>
    this.activeWorkOrder()?.description ??
    'Ruido en el motor al acelerar en frío y pérdida leve de potencia.'
  );

  protected readonly technicalDiagnosis = computed(() => {
    const order = this.activeWorkOrder();

    if (!order) {
      return 'Diagnóstico pendiente de registro técnico.';
    }

    if (this.vehicleTasks().length === 0) {
      return 'Se requiere registrar tareas técnicas para completar el diagnóstico operativo.';
    }

    return 'Revisión técnica registrada. Se identificaron tareas asociadas al mantenimiento del vehículo.';
  });

  ngOnInit(): void {
    this.vehicleStore.loadVehicles();
    this.customerStore.loadCustomers();
    this.workOrderStore.loadWorkOrders();
    this.taskStore.loadAllTasks();
  }

  protected goBack(): void {
    this.router.navigate(['/admin/vehicles']);
  }

  protected goToNewTask(): void {
    const order = this.activeWorkOrder();

    if (order?.id) {
      this.router.navigate(['/admin/tasks'], {
        queryParams: {
          workOrderId: order.id,
          vehicleId: this.vehicleId
        }
      });

      return;
    }

    this.router.navigate(['/admin/tasks']);
  }

  protected goToWorkOrder(): void {
    const order = this.activeWorkOrder();

    if (order?.id) {
      this.router.navigate(['/admin/work-orders', order.id]);
      return;
    }

    this.router.navigate(['/admin/work-orders']);
  }

  protected getVehicleName(vehicle: Vehicle): string {
    return `${vehicle.brand} ${vehicle.model}`;
  }

  protected getStatusLabel(status: Vehicle['status']): string {
    if (status === 'En Taller') {
      return 'En curso';
    }

    if (status === 'Listo') {
      return 'Completado';
    }

    return 'Entregado';
  }

  protected getTaskStatusLabel(status: Task['status']): string {
    if (status === 'En Proceso') {
      return 'En curso';
    }

    return status;
  }

  protected getTaskStatusClass(status: Task['status']): string {
    if (status === 'Completada') {
      return 'task-completed';
    }

    if (status === 'En Proceso') {
      return 'task-progress';
    }

    return 'task-pending';
  }

  protected getTaskIcon(status: Task['status']): string {
    if (status === 'Completada') {
      return 'check_circle';
    }

    if (status === 'En Proceso') {
      return 'sync';
    }

    return 'schedule';
  }
}
