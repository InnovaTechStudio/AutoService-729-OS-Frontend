import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { TaskStore } from '../../../workshop-operations/application/task.store';
import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { MechanicStore } from '../../application/mechanic.store';
import { Task } from '../../../workshop-operations/domain/models/work-order.model';
import { CustomerStore } from '../../../customer-management/application/customer.store';

type MechanicTaskStatus = Task['status'];
type MechanicTaskPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';

@Component({
  selector: 'app-mechanic-workspace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
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
  protected readonly customerStore = inject(CustomerStore);

  protected readonly statusOptions: MechanicTaskStatus[] = [
    'Pendiente',
    'En Proceso',
    'Completada'
  ];

  protected readonly selectedStatus = signal<MechanicTaskStatus | 'Todas'>('Todas');
  protected readonly selectedTask = signal<Task | null>(null);

  /**
   * Temporary mechanic id for the simulated mechanic session.
   * Later this can come from authenticated user data.
   */
  protected readonly currentMechanicId = signal<string>(
    localStorage.getItem('auth_mechanic_id') ?? 'M-1'
  );

  protected readonly currentMechanic = computed(() =>
    this.mechanicStore
      .mechanics()
      .find((mechanic) => String(mechanic.id) === String(this.currentMechanicId()))
  );

  protected readonly mechanicName = computed(() =>
    this.currentMechanic()?.fullName ?? 'Carlos Ramírez'
  );

  protected readonly mechanicSpecialty = computed(() =>
    this.currentMechanic()?.specialty ?? 'Mecánica general'
  );

  protected readonly mechanicStatus = computed(() =>
    this.currentMechanic()?.status ?? 'Turno activo'
  );

  protected readonly assignedTasks = computed(() =>
    this.taskStore
      .tasks()
      .filter((task) => String(task.mechanicId) === String(this.currentMechanicId()))
  );

  protected readonly filteredTasks = computed(() => {
    const status = this.selectedStatus();

    if (status === 'Todas') {
      return this.assignedTasks();
    }

    return this.assignedTasks().filter((task) => task.status === status);
  });

  protected readonly pendingTasks = computed(() =>
    this.assignedTasks().filter((task) => task.status === 'Pendiente').length
  );

  protected readonly inProgressTasks = computed(() =>
    this.assignedTasks().filter((task) => task.status === 'En Proceso').length
  );

  protected readonly completedTasks = computed(() =>
    this.assignedTasks().filter((task) => task.status === 'Completada').length
  );

  protected readonly generalProgress = computed(() => {
    const total = this.assignedTasks().length;

    if (total === 0) {
      return 0;
    }

    return Math.round((this.completedTasks() / total) * 100);
  });

  ngOnInit(): void {
    this.taskStore.loadAllTasks();
    this.workOrderStore.loadWorkOrders();
    this.vehicleStore.loadVehicles();
    this.mechanicStore.loadMechanics();
    this.customerStore.loadCustomers();
  }

  protected selectStatus(status: MechanicTaskStatus | 'Todas'): void {
    this.selectedStatus.set(status);
  }

  protected openTask(task: Task): void {
    this.selectedTask.set({
      ...task,
      priority: task.priority ?? 'Media',
      estimatedTime: task.estimatedTime ?? 2,
      technicalDiagnosis: task.technicalDiagnosis ?? '',
      customerExplanation: task.customerExplanation ?? '',
      internalObservation: task.internalObservation ?? '',
      evidenceRegistered: task.evidenceRegistered ?? false,
      adminReviewStatus: task.adminReviewStatus ?? 'Sin enviar',
      customerReportStatus: task.customerReportStatus ?? 'No visible',
      completedAt: task.completedAt ?? ''
    });
  }

  protected closeTaskPanel(): void {
    this.selectedTask.set(null);
  }

  protected updateTaskStatus(taskId: string | undefined, status: MechanicTaskStatus): void {
    if (!taskId) {
      return;
    }

    const current = this.selectedTask();

    if (current?.id === taskId) {
      this.selectedTask.set({
        ...current,
        status,
        adminReviewStatus: 'Enviado al Administrador'
      });
    }

    this.taskStore.updateTaskStatus(taskId, status);
  }

  protected startSelectedTask(): void {
    const current = this.selectedTask();

    if (!current?.id) {
      return;
    }

    const updatedTask: Task = {
      ...current,
      status: 'En Proceso',
      adminReviewStatus: 'Enviado al Administrador'
    };

    this.selectedTask.set(updatedTask);
    this.taskStore.updateMechanicTechnicalReport(current.id, updatedTask);
  }

  protected generateCustomerExplanation(): void {
    const current = this.selectedTask();

    if (!current) {
      return;
    }

    this.selectedTask.set({
      ...current,
      customerExplanation: this.buildCustomerExplanation(current)
    });
  }

  protected canCompleteSelectedTask(): boolean {
    const current = this.selectedTask();

    if (!current) {
      return false;
    }

    return !!current.technicalDiagnosis?.trim() &&
      !!current.customerExplanation?.trim() &&
      !!current.evidenceRegistered;
  }

  protected completeSelectedTask(): void {
    const current = this.selectedTask();

    if (!current?.id || !this.canCompleteSelectedTask()) {
      return;
    }

    const completedTask: Task = {
      ...current,
      status: 'Completada',
      adminReviewStatus: 'Enviado al Administrador',
      customerReportStatus: 'Visible para Cliente',
      completedAt: new Date().toLocaleString('es-PE')
    };

    this.selectedTask.set(completedTask);
    this.taskStore.completeTaskFromMechanic(current.id, completedTask);
  }

  protected saveTechnicalUpdate(): void {
    const editedTask = this.selectedTask();

    if (!editedTask?.id) {
      return;
    }

    const updatedTask: Task = {
      ...editedTask,
      adminReviewStatus: 'Enviado al Administrador'
    };

    this.selectedTask.set(updatedTask);
    this.taskStore.updateMechanicTechnicalReport(editedTask.id, updatedTask);
  }

  protected toggleEvidence(): void {
    const current = this.selectedTask();

    if (!current) {
      return;
    }

    this.selectedTask.set({
      ...current,
      evidenceRegistered: !current.evidenceRegistered
    });
  }

  protected getOrderCode(task: Task): string {
    const order = this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(task.workOrderId));

    return order?.trackingCode ?? `WO-${task.workOrderId}`;
  }

  protected getVehicleName(task: Task): string {
    const order = this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(task.workOrderId));

    if (!order) {
      return 'Vehículo no encontrado';
    }

    const vehicle = this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(order.vehicleId));

    return vehicle
      ? `${vehicle.brand} ${vehicle.model}`
      : 'Vehículo no encontrado';
  }

  protected getVehiclePlate(task: Task): string {
    const order = this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(task.workOrderId));

    if (!order) {
      return '---';
    }

    const vehicle = this.vehicleStore
      .vehicles()
      .find((item) => String(item.id) === String(order.vehicleId));

    return vehicle?.plate ?? '---';
  }

  protected getCustomerName(task: Task): string {
    const order = this.workOrderStore
      .workOrders()
      .find((item) => String(item.id) === String(task.workOrderId));

    if (!order?.customerId) {
      return 'Cliente no asignado';
    }

    const customer = this.customerStore
      .customers()
      .find((item) => String(item.id) === String(order.customerId));

    return customer?.fullName ?? `Cliente ${order.customerId}`;
  }

  protected getPriorityClass(priority?: MechanicTaskPriority): string {
    if (priority === 'Crítica') return 'priority-critical';
    if (priority === 'Alta') return 'priority-high';
    if (priority === 'Media') return 'priority-medium';
    return 'priority-low';
  }

  protected getStatusClass(status: MechanicTaskStatus): string {
    if (status === 'Completada') return 'status-completed';
    if (status === 'En Proceso') return 'status-progress';
    return 'status-pending';
  }

  protected getStatusIcon(status: MechanicTaskStatus): string {
    if (status === 'Completada') return 'check_circle';
    if (status === 'En Proceso') return 'engineering';
    return 'schedule';
  }

  protected getAdminSyncClass(task: Task): string {
    return task.adminReviewStatus === 'Enviado al Administrador'
      ? 'sync-sent'
      : 'sync-pending';
  }

  protected getCustomerReportClass(task: Task): string {
    return task.customerReportStatus === 'Visible para Cliente'
      ? 'customer-visible'
      : 'customer-hidden';
  }

  private buildCustomerExplanation(task: Task): string {
    const diagnosis = task.technicalDiagnosis?.toLowerCase() ?? '';

    if (!task.technicalDiagnosis?.trim()) {
      return 'El Mecánico aún está revisando el vehículo. Cuando termine el diagnóstico, se mostrará una explicación clara del trabajo recomendado.';
    }

    if (diagnosis.includes('freno') || diagnosis.includes('pastilla') || diagnosis.includes('disco')) {
      return 'Se detectó desgaste en el sistema de frenos. Se recomienda atenderlo para mantener la seguridad del vehículo al manejar.';
    }

    if (diagnosis.includes('motor') || diagnosis.includes('potencia') || diagnosis.includes('arranque')) {
      return 'Se detectó una condición que puede afectar el funcionamiento del motor. El taller revisará la causa para evitar fallas mayores.';
    }

    if (diagnosis.includes('aceite') || diagnosis.includes('filtro')) {
      return 'Se realizará mantenimiento preventivo para proteger el motor y mantener el vehículo en buen estado.';
    }

    if (diagnosis.includes('llanta') || diagnosis.includes('neumático') || diagnosis.includes('alineación')) {
      return 'Se detectó una condición relacionada con las llantas o alineación. Se recomienda corregirla para mejorar estabilidad y seguridad.';
    }

    return 'El Mecánico registró una observación técnica del vehículo. Esta información será revisada por el taller para explicar el trabajo necesario de forma clara.';
  }
}
