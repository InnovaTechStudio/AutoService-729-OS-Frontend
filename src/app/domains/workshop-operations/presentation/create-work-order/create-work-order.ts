import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { WorkOrderStore } from '../../application/work-order.store';
import { CustomerStore } from '../../../customer-management/application/customer.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';
import { WorkOrder } from '../../domain/models/work-order.model';

@Component({
  selector: 'app-create-work-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './create-work-order.html',
  styleUrl: './create-work-order.css',
})
export class CreateWorkOrderComponent implements OnInit {
  private router = inject(Router);
  public translate = inject(TranslateService);

  private workOrderStore = inject(WorkOrderStore);
  public customerStore = inject(CustomerStore);
  public vehicleStore = inject(VehicleStore);
  public mechanicStore = inject(MechanicStore);

  form = {
    customerId: null as string | number | null,
    vehicleId: null as string | number | null,
    mechanicId: null as string | number | null,
    estimatedDate: '',
    description: '',
  };

  autoCustomerName = '';
  isSaving = signal(false);

  async ngOnInit() {
    await Promise.all([
      this.customerStore.loadCustomers(),
      this.vehicleStore.loadVehicles(),
      this.mechanicStore.loadMechanics(),
    ]);
  }

  handleVehicleChange() {
    const selectedVehicle = this.vehicleStore.vehicles().find((v) => v.id === this.form.vehicleId);

    if (!selectedVehicle) {
      this.form.customerId = null;
      this.autoCustomerName = '';
      return;
    }

    this.form.customerId = selectedVehicle.customerId;

    const customer = this.customerStore
      .customers()
      .find((c) => String(c.id) === String(selectedVehicle.customerId));

    this.autoCustomerName = customer
      ? customer.fullName
      : this.translate.instant('workOrders.create.customerNotFound');
  }

  generateTrackingCode(): string {
    const prefix = 'ORD';
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
  }

  async saveOrder() {
    if (
      !this.form.customerId ||
      !this.form.vehicleId ||
      !this.form.mechanicId ||
      !this.form.estimatedDate
    ) {
      return;
    }

    this.isSaving.set(true);
    try {
      const payload: WorkOrder = {
        trackingCode: this.generateTrackingCode(),
        status: 'PENDING',
        startDate: new Date().toISOString().split('T')[0],
        estimatedDate: this.form.estimatedDate,
        price: 0,
        vehicleId: this.form.vehicleId as number,
        customerId: this.form.customerId as number,
        mechanicId: this.form.mechanicId as number,
        description: this.form.description || 'Sin descripción inicial',
      };

      const newOrder = await this.workOrderStore.addWorkOrder(payload);
      this.router.navigate([`/work-orders/${newOrder.id}`]);
    } catch (error) {
      console.error(error);
    } finally {
      this.isSaving.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/work-orders']);
  }
}
