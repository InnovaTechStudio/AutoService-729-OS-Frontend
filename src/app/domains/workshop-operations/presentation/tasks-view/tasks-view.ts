import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips'; // Reemplazo de Tag de PrimeVue
import { MatTooltipModule } from '@angular/material/tooltip';

import { TaskStore } from '../../application/task.store';
import { WorkOrderStore } from '../../application/work-order.store';
import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';
import { Task } from '../../domain/models/work-order.model';

@Component({
  selector: 'app-tasks-view',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatChipsModule, MatTooltipModule
  ],
  templateUrl: './tasks-view.html',
  styleUrl: './tasks-view.css'
})
export class TasksViewComponent implements OnInit {
  taskStore = inject(TaskStore);
  workOrderStore = inject(WorkOrderStore);
  mechanicStore = inject(MechanicStore);
  private router = inject(Router);

  displayedColumns: string[] = ['workOrder', 'description', 'mechanic', 'status', 'actions'];
  statusOptions = ['Pendiente', 'En Proceso', 'Completada'];

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.taskStore.loadAllTasks();
    if (this.workOrderStore.workOrders().length === 0) this.workOrderStore.loadWorkOrders();
    if (this.mechanicStore.mechanics().length === 0) this.mechanicStore.loadMechanics();
  }

  getWorkOrderCode(woId: string): string {
    if (!woId) return 'N/A';
    const wo = this.workOrderStore.workOrders().find(w => String(w.id) === String(woId));
    return wo ? wo.trackingCode || 'Desconocida' : 'Desconocida';
  }

  getMechanicName(mechanicId: string): string {
    if (!mechanicId) return 'Sin asignar';
    const mechanic = this.mechanicStore.mechanics().find(m => String(m.id) === String(mechanicId));
    return mechanic ? mechanic.fullName : 'No encontrado';
  }

  onStatusChange(task: Task, newStatus: string) {
    if (task.id) {
      this.taskStore.updateTaskStatus(task.id, newStatus);
    }
  }

  goToWorkOrder(woId: string) {
    if (woId) {
      this.router.navigate(['/admin/work-orders', woId]);
    }
  }
}
