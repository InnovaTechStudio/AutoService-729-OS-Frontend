import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { WorkOrderStore } from '../../application/work-order.store';
import { TaskStore } from '../../application/task.store';
import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';
import { WorkOrder, Task } from '../../domain/models/work-order.model';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatTableModule, MatSelectModule,
    MatDialogModule, MatChipsModule
  ],
  templateUrl: './work-order-detail.html',
  styleUrl: './work-order-detail.css'
})
export class WorkOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  workOrderStore = inject(WorkOrderStore);
  taskStore = inject(TaskStore);
  mechanicStore = inject(MechanicStore);

  orderId = '';
  localPrice = 0;
  priceInitialized = false; // Bandera para no sobreescribir el input mientras el usuario escribe

  displayedColumns = ['description', 'mechanic', 'status'];

  @ViewChild('taskDialog') taskDialogTemplate!: TemplateRef<any>;
  newTask: Partial<Task> = { description: '', status: 'Pendiente', mechanicId: '' };

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';

    if (this.workOrderStore.workOrders().length === 0) this.workOrderStore.loadWorkOrders();
    if (this.mechanicStore.mechanics().length === 0) this.mechanicStore.loadMechanics();
    this.taskStore.loadAllTasks();
  }

  // Getter para buscar la orden dinámicamente
  get order(): WorkOrder | undefined {
    const o = this.workOrderStore.workOrders().find(w => String(w.id) === String(this.orderId));
    if (o && !this.priceInitialized && o.price !== undefined) {
      this.localPrice = o.price;
      this.priceInitialized = true;
    }
    return o;
  }

  // Getter para filtrar solo las tareas de esta orden
  get orderTasks(): Task[] {
    return this.taskStore.tasks().filter(t => String(t.workOrderId) === String(this.orderId));
  }

  getMechanicName(id: string): string {
    if (!id) return 'Sin asignar';
    const mech = this.mechanicStore.mechanics().find(m => String(m.id) === String(id));
    return mech ? mech.fullName : 'No encontrado';
  }

  goBack() {
    this.router.navigate(['/admin/work-orders']);
  }

  savePrice() {
    if (this.order && this.order.id) {
      this.workOrderStore.updateWorkOrder(this.order.id, { price: this.localPrice });
    }
  }

  openTaskDialog() {
    this.newTask = { workOrderId: this.orderId, description: '', status: 'Pendiente', mechanicId: '' };
    this.dialog.open(this.taskDialogTemplate, { width: '400px' });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  saveTask() {
    if (this.newTask.description && this.newTask.mechanicId) {
      this.taskStore.addTask(this.newTask as Task);
      this.closeDialog();
    }
  }

  updateTaskStatus(task: Task, newStatus: string) {
    if (task.id) {
      this.taskStore.updateTaskStatus(task.id, newStatus);
    }
  }
}
