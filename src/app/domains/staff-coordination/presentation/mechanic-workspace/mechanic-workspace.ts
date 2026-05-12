import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { TaskStore } from '../../../workshop-operations/application/task.store';
import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { MechanicStore } from '../../application/mechanic.store';
import { Task } from '../../../workshop-operations/domain/models/work-order.model';

@Component({
  selector: 'app-mechanic-workspace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule
  ],
  templateUrl: './mechanic-workspace.html',
  styleUrl: './mechanic-workspace.css'
})
export class MechanicWorkspaceComponent implements OnInit {
  protected readonly taskStore = inject(TaskStore);
  protected readonly workOrderStore = inject(WorkOrderStore);
  protected readonly vehicleStore = inject(VehicleStore);
  protected readonly mechanicStore = inject(MechanicStore);
  private readonly router = inject(Router);

  protected readonly selectedMechanicId = signal<string>('');

  protected readonly statusOptions: Task['status'][] = [
    'Pendiente',
    'En Proceso',
    'Completada'
  ];

  protected readonly currentMechanic = computed(() =>
    this.mechanicStore
      .mechanics()
      .find((mechanic) => String(mechanic.id) === String(this.selectedMechanicId()))
  );

  protected readonly assignedTasks = computed(() =>
    this.taskStore
      .tasks()
      .filter((task) => String(task.mechanicId) === String(this.selectedMechanicId()))
  );

  protected readonly pendingTasks = computed(() =>
    this.assignedTasks().filter((task) => task.status === 'Pendiente').length
  );

  protected readonly inProgressTasks = computed(() =>
    this.assignedTasks().filter((task) => task.status === 'En Proceso').length
  );

  protected readonly completedTasks = computed(() =>
    this.assignedTasks().filter((task) => task.status === 'Completada').length
  );

  protected readonly progress = computed(() => {
    const tasks = this.assignedTasks();

    if (!tasks.length) {
      return 0;
    }

    return Math.round((this.completedTasks() / tasks.length) * 100);
  });

  ngOnInit(): void {
    this.mechanicStore.loadMechanics();
    this.taskStore.loadAllTasks();
    this.workOrderStore.loadWorkOrders();
    this.vehicleStore.loadVehicles();

    setTimeout(() => {
      const firstMechanic = this.mechanicStore.mechanics()[0];
      if (firstMechanic?.id && !this.selectedMechanicId()) {
        this.selectedMechanicId.set(String(firstMechanic.id));
      }
    }, 300);
  }

  protected selectMechanic(id: string): void {
    this.selectedMechanicId.set(id);
  }

  protected updateTaskStatus(task: Task, status: Task['status']): void {
    if (!task.id) {
      return;
    }

    this.taskStore.updateTaskStatus(task.id, status);
  }

  protected getWorkOrderCode(workOrderId: string): string {
    const order = this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(workOrderId));

    return order?.trackingCode || `WO-${workOrderId}`;
  }

  protected getVehicleName(workOrderId: string): string {
    const order = this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(workOrderId));

    if (!order) {
      return 'Vehículo no encontrado';
    }

    const vehicle = this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(order.vehicleId));

    return vehicle
      ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`
      : 'Vehículo no encontrado';
  }

  protected goToOrder(workOrderId: string): void {
    this.router.navigate(['/admin/work-orders', workOrderId]);
  }

  protected getTaskClass(status: Task['status']): string {
    if (status === 'Completada') return 'task-completed';
    if (status === 'En Proceso') return 'task-progress';
    return 'task-pending';
  }

  protected getTaskIcon(status: Task['status']): string {
    if (status === 'Completada') return 'check_circle';
    if (status === 'En Proceso') return 'sync';
    return 'schedule';
  }
}
