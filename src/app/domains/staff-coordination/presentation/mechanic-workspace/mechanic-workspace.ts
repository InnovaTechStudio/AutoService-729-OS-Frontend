import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

type MechanicTaskStatus = 'Pendiente' | 'En Proceso' | 'Completada';
type MechanicTaskPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';

interface MechanicTask {
  id: string;
  orderCode: string;
  vehicle: string;
  plate: string;
  customerName: string;
  taskName: string;
  description: string;
  status: MechanicTaskStatus;
  priority: MechanicTaskPriority;
  estimatedTime: number;
  technicalDiagnosis: string;
  customerExplanation: string;
  internalObservation: string;
  evidenceRegistered: boolean;
}

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
export class MechanicWorkspaceComponent {
  protected readonly mechanicName = 'Carlos Ramírez';
  protected readonly mechanicSpecialty = 'Mecánica general';
  protected readonly mechanicStatus = 'Turno activo';

  protected readonly statusOptions: MechanicTaskStatus[] = [
    'Pendiente',
    'En Proceso',
    'Completada'
  ];

  protected readonly selectedStatus = signal<MechanicTaskStatus | 'Todas'>('Todas');
  protected readonly selectedTask = signal<MechanicTask | null>(null);

  protected readonly tasks = signal<MechanicTask[]>([
    {
      id: 'T-001',
      orderCode: 'WO-1001',
      vehicle: 'Toyota Corolla 2020',
      plate: 'ABC-123',
      customerName: 'Juan Pérez',
      taskName: 'Revisión de frenos',
      description: 'Inspeccionar desgaste de pastillas y verificar presión del sistema.',
      status: 'En Proceso',
      priority: 'Alta',
      estimatedTime: 2,
      technicalDiagnosis: 'Se observa desgaste irregular en pastillas delanteras y ligera vibración al frenar.',
      customerExplanation: 'Los frenos delanteros presentan desgaste y deben revisarse para evitar pérdida de seguridad al manejar.',
      internalObservation: 'Revisar discos antes de aprobar cambio de pastillas.',
      evidenceRegistered: true
    },
    {
      id: 'T-002',
      orderCode: 'WO-1002',
      vehicle: 'Hyundai Tucson 2021',
      plate: 'XYZ-789',
      customerName: 'María López',
      taskName: 'Diagnóstico de motor',
      description: 'Evaluar ruido en arranque y pérdida de potencia.',
      status: 'Pendiente',
      priority: 'Crítica',
      estimatedTime: 3,
      technicalDiagnosis: '',
      customerExplanation: '',
      internalObservation: '',
      evidenceRegistered: false
    },
    {
      id: 'T-003',
      orderCode: 'WO-1003',
      vehicle: 'Kia Rio 2019',
      plate: 'FRT-456',
      customerName: 'Luis Torres',
      taskName: 'Cambio de aceite y filtros',
      description: 'Realizar mantenimiento preventivo básico.',
      status: 'Completada',
      priority: 'Media',
      estimatedTime: 1,
      technicalDiagnosis: 'Aceite degradado por kilometraje. Filtro de aceite con saturación normal.',
      customerExplanation: 'Se realizó el cambio de aceite y filtro para mantener el motor protegido.',
      internalObservation: 'Próximo cambio recomendado en 5,000 km.',
      evidenceRegistered: true
    }
  ]);

  protected readonly filteredTasks = computed(() => {
    const status = this.selectedStatus();

    if (status === 'Todas') {
      return this.tasks();
    }

    return this.tasks().filter((task) => task.status === status);
  });

  protected readonly pendingTasks = computed(() =>
    this.tasks().filter((task) => task.status === 'Pendiente').length
  );

  protected readonly inProgressTasks = computed(() =>
    this.tasks().filter((task) => task.status === 'En Proceso').length
  );

  protected readonly completedTasks = computed(() =>
    this.tasks().filter((task) => task.status === 'Completada').length
  );

  protected readonly generalProgress = computed(() => {
    const total = this.tasks().length;

    if (total === 0) {
      return 0;
    }

    return Math.round((this.completedTasks() / total) * 100);
  });

  protected selectStatus(status: MechanicTaskStatus | 'Todas'): void {
    this.selectedStatus.set(status);
  }

  protected openTask(task: MechanicTask): void {
    this.selectedTask.set({ ...task });
  }

  protected closeTaskPanel(): void {
    this.selectedTask.set(null);
  }

  protected updateTaskStatus(taskId: string, status: MechanicTaskStatus): void {
    this.tasks.update((tasks) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );

    const current = this.selectedTask();

    if (current?.id === taskId) {
      this.selectedTask.set({ ...current, status });
    }
  }

  protected saveTechnicalUpdate(): void {
    const editedTask = this.selectedTask();

    if (!editedTask) {
      return;
    }

    this.tasks.update((tasks) =>
      tasks.map((task) =>
        task.id === editedTask.id ? { ...editedTask } : task
      )
    );

    this.selectedTask.set({ ...editedTask });
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

  protected getPriorityClass(priority: MechanicTaskPriority): string {
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
}
