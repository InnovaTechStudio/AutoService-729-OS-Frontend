/**
 * CreateWorkOrderComponent
 *
 * Component responsible for creating a complete work order.
 * It allows the user to select a vehicle, automatically identify
 * the owner customer, enter general order information, add multiple
 * task rows dynamically and save the work order together with all
 * associated tasks.
 *
 * @component
 * @selector app-create-work-order
 * @standalone true
 */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

// ngx-translate
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    TranslateModule
  ],
  templateUrl: './create-work-order.html',
  styleUrl: './create-work-order.css'
})
export class CreateWorkOrderComponent implements OnInit {

  private router = inject(Router);
  private translate = inject(TranslateService);

  /**
   * Store responsible for managing work orders.
   */
  workOrderStore = inject(WorkOrderStore);

  /**
   * Store responsible for managing tasks.
   */
  taskStore = inject(TaskStore);

  /**
   * Store responsible for managing vehicles.
   */
  vehicleStore = inject(VehicleStore);

  /**
   * Store responsible for managing customers.
   */
  customerStore = inject(CustomerStore);

  /**
   * Store responsible for managing mechanics.
   */
  mechanicStore = inject(MechanicStore);

  /**
   * Indicates whether the complete work order is being saved.
   */
  isSaving = false;

  /**
   * Name of the customer associated with the selected vehicle.
   */
  selectedCustomerName = '';

  /**
   * Partial work order data bound to the form.
   */
  newWO: Partial<WorkOrder> = {
    vehicleId: '',
    customerId: '',
    description: '',
    estimatedDate: '',
    price: 0,
    status: 'En Proceso'
  };

  /**
   * Task rows that will be created together with the work order.
   */
  tasks: Partial<Task>[] = [];

  /**
   * Loads vehicles, customers and mechanics required by the form.
   */
  ngOnInit(): void {
    if (this.vehicleStore.vehicles().length === 0) {
      this.vehicleStore.loadVehicles();
    }

    if (this.customerStore.customers().length === 0) {
      this.customerStore.loadCustomers();
    }

    if (this.mechanicStore.mechanics().length === 0) {
      this.mechanicStore.loadMechanics();
    }
  }

  /**
   * Navigates back to the work order list.
   */
  goBack(): void {
    this.router.navigate(['/admin/work-orders']);
  }

  /**
   * Handles vehicle selection and automatically assigns the owner customer
   * to the work order form.
   *
   * @param vehicleId Selected vehicle identifier.
   */
  onVehicleChange(vehicleId: string): void {
    const vehicle = this.vehicleStore
      .vehicles()
      .find(vehicleItem => String(vehicleItem.id) === String(vehicleId));

    if (vehicle) {
      this.newWO.customerId = vehicle.customerId;

      const customer = this.customerStore
        .customers()
        .find(customerItem => String(customerItem.id) === String(vehicle.customerId));

      this.selectedCustomerName = customer
        ? customer.fullName
        : this.translate.instant('CREATE_WORK_ORDER.NOT_FOUND');
    }
  }

  /**
   * Adds a new empty task row to the form.
   */
  addTaskRow(): void {
    this.tasks.push({
      description: '',
      mechanicId: '',
      status: 'Pendiente'
    });
  }

  /**
   * Removes a task row from the form.
   *
   * @param index Index of the task row to remove.
   */
  removeTaskRow(index: number): void {
    this.tasks.splice(index, 1);
  }

  /**
   * Saves the complete work order and all associated tasks.
   * The work order is created first, then each valid task is created
   * using the generated work order ID.
   */
  saveFullWorkOrder(): void {
    if (!this.newWO.vehicleId || this.tasks.length === 0) {
      alert(this.translate.instant('CREATE_WORK_ORDER.VALIDATION_MESSAGE'));
      return;
    }

    this.isSaving = true;

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

    this.workOrderStore.addWorkOrder(payloadWO).subscribe({
      next: (createdOrder) => {
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
        console.error(this.translate.instant('CREATE_WORK_ORDER.SAVE_ERROR'), err);
        this.isSaving = false;
      }
    });
  }
}