import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

// Stores
import { WorkOrderStore } from '../../application/work-order.store';
import { TaskStore } from '../../application/task.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { CustomerStore } from '../../../customer-management/application/customer.store';
import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';

// Models
import { WorkOrder, Task } from '../../domain/models/work-order.model';

@Component({
  selector: 'app-create-work-order',
  standalone: true,
  providers: [provideNativeDateAdapter()], // Necesario para el MatDatepicker
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule
  ],
  templateUrl: './create-work-order.html',
  styleUrl: './create-work-order.css'
})
export class CreateWorkOrderComponent implements OnInit {
  private router = inject(Router);

  workOrderStore = inject(WorkOrderStore);
  taskStore = inject(TaskStore);
  vehicleStore = inject(VehicleStore);
  customerStore = inject(CustomerStore);
  mechanicStore = inject(MechanicStore);

  isSaving = false;
  selectedCustomerName = '';

  // Estado del formulario
  newWO: Partial<WorkOrder> = {
    vehicleId: '',
    customerId: '',
    description: '',
    estimatedDate: '',
    price: 0,
    status: 'En Proceso'
  };

  // Array dinámico de tareas
  tasks: Partial<Task>[] = [];

  ngOnInit() {
    // Cargar dependencias necesarias
    if (this.vehicleStore.vehicles().length === 0) this.vehicleStore.loadVehicles();
    if (this.customerStore.customers().length === 0) this.customerStore.loadCustomers();
    if (this.mechanicStore.mechanics().length === 0) this.mechanicStore.loadMechanics();
  }

  goBack() {
    this.router.navigate(['/admin/work-orders']);
  }

  onVehicleChange(vehicleId: string) {
    const vehicle = this.vehicleStore.vehicles().find(v => String(v.id) === String(vehicleId));
    if (vehicle) {
      this.newWO.customerId = vehicle.customerId;
      const customer = this.customerStore.customers().find(c => String(c.id) === String(vehicle.customerId));
      this.selectedCustomerName = customer ? customer.fullName : 'No encontrado';
    }
  }

  addTaskRow() {
    this.tasks.push({ description: '', mechanicId: '', status: 'Pendiente' });
  }

  removeTaskRow(index: number) {
    this.tasks.splice(index, 1);
  }

  saveFullWorkOrder() {
    if (!this.newWO.vehicleId || this.tasks.length === 0) {
      alert("Debes seleccionar un vehículo y añadir al menos una tarea.");
      return;
    }

    this.isSaving = true;

    // SOLUCIÓN AL TS2358: Usamos 'any' temporalmente para evaluar lo que inyectó el Datepicker
    const rawDate: any = this.newWO.estimatedDate;
    let formattedDate = this.newWO.estimatedDate;

    if (rawDate instanceof Date) {
      formattedDate = rawDate.toISOString().split('T')[0];
    }

    const payloadWO: WorkOrder = {
      ...(this.newWO as WorkOrder),
      trackingCode: `AS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      startDate: new Date().toISOString().split('T')[0],
      estimatedDate: formattedDate as string
    };

    // 1. Crear la orden principal
    this.workOrderStore.addWorkOrder(payloadWO).subscribe({
      next: (createdOrder) => {
        // 2. Recorrer y crear todas las tareas asociadas al ID de la orden
        this.tasks.forEach(task => {
          if (task.description) {
            this.taskStore.addTask({
              ...(task as Task),
              workOrderId: createdOrder.id!
            });
          }
        });

        this.isSaving = false;
        this.router.navigate(['/admin/work-orders']);
      },
      error: (err) => {
        console.error("Error al guardar la orden completa:", err);
        this.isSaving = false;
      }
    });
  }
}
