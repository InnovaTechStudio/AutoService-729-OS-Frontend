import { Component, computed, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { CustomerStore } from '../../../customer-management/application/customer.store';
import { VehicleStore } from '../../application/vehicle.store';
import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';
import { TaskStore } from '../../../workshop-operations/application/task.store';
import { Vehicle } from '../../domain/models/vehicle.model';
import { VehicleCardComponent } from './components/vehicle-card/vehicle-card';
import { VehicleFiltersComponent } from './components/vehicle-filters/vehicle-filters';

const VEHICLE_STATUS = { IN_WORKSHOP: 'IN_WORKSHOP', READY: 'READY', DELIVERED: 'DELIVERED' };
const ORDER_STATUS = { FINISHED: 'FINISHED', DELIVERED: 'DELIVERED', CANCELLED: 'CANCELLED' };
const REVIEW_STATUS = { APPROVED: 'APPROVED' };

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    VehicleCardComponent,
    VehicleFiltersComponent,
    TranslatePipe,
  ],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.css',
})
export class VehicleListComponent implements OnInit {
  vehicleStore = inject(VehicleStore);
  customerStore = inject(CustomerStore);
  workOrderStore = inject(WorkOrderStore);
  taskStore = inject(TaskStore);

  private dialog = inject(MatDialog);
  private router = inject(Router);
  public translate = inject(TranslateService);

  @ViewChild('vehicleDialog') vehicleDialogTemplate!: TemplateRef<any>;

  vehicle = signal<Vehicle>(this.getEmptyVehicle());
  isEditing = signal(false);

  search = signal('');
  selectedStatus = signal<string | null>(null);
  selectedSort = signal<string | null>(null);

  statusOptions = computed(() => [
    {
      label: this.translate.instant('vehicles.statusOptions.in_workshop'),
      value: VEHICLE_STATUS.IN_WORKSHOP,
    },
    { label: this.translate.instant('vehicles.statusOptions.ready'), value: VEHICLE_STATUS.READY },
    {
      label: this.translate.instant('vehicles.statusOptions.delivered'),
      value: VEHICLE_STATUS.DELIVERED,
    },
  ]);

  sortOptions = computed(() => [
    { label: this.translate.instant('vehicles.sortOptions.progressDesc'), value: 'progress-desc' },
    { label: this.translate.instant('vehicles.sortOptions.progressAsc'), value: 'progress-asc' },
  ]);

  carImages = [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop',
  ];

  async ngOnInit() {
    try {
      await Promise.all([
        this.customerStore.loadCustomers(),
        this.vehicleStore.loadVehicles(),
        this.workOrderStore.loadWorkOrders(),
        this.taskStore.loadAllTasks(),
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  getCustomerName(id: string | number | null): string {
    const customer = this.customerStore.customers().find((c) => String(c.id) === String(id));
    return customer ? customer.fullName : this.translate.instant('common.noAssigned');
  }

  getSeverity(status: string): string {
    switch (status) {
      case VEHICLE_STATUS.IN_WORKSHOP:
        return 'info';
      case VEHICLE_STATUS.READY:
        return 'success';
      case VEHICLE_STATUS.DELIVERED:
        return 'secondary';
      default:
        return 'warning';
    }
  }

  getStatusLabel(status: string): string {
    const key = String(status).toLowerCase();
    return this.translate.instant(`vehicles.statusOptions.${key}`);
  }

  getProgress(vehicleId: string | number, status: string): number {
    if ([VEHICLE_STATUS.READY, VEHICLE_STATUS.DELIVERED].includes(status)) return 100;

    const activeOrder = this.workOrderStore
      .workOrders()
      .find(
        (o) =>
          String(o.vehicleId) === String(vehicleId) &&
          ![ORDER_STATUS.FINISHED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(
            o.status,
          ),
      );
    if (!activeOrder) return 0;

    const orderTasks = this.taskStore
      .tasks()
      .filter((t) => String(t.workOrderId) === String(activeOrder.id));
    if (!orderTasks.length) return 0;

    const approvedTasks = orderTasks.filter(
      (t) => (t as any).adminReviewStatus === REVIEW_STATUS.APPROVED,
    ).length;
    return Math.round((approvedTasks / orderTasks.length) * 100);
  }

  vehiclesView = computed(() => {
    return this.vehicleStore.vehicles().map((item, index) => {
      const rawStatus = item.status || VEHICLE_STATUS.IN_WORKSHOP;
      return {
        id: item.id,
        raw: item,
        name: `${item.brand} ${item.model || ''}`,
        plate: item.plate,
        owner: this.getCustomerName(item.customerId),
        status: this.getStatusLabel(rawStatus),
        rawStatus: rawStatus,
        severity: this.getSeverity(rawStatus),
        progress: this.getProgress(item.id!, rawStatus),
        year: item.year || 'N/A',
        color: item.color || 'N/A',
        image: item.image || this.carImages[index % this.carImages.length],
      };
    });
  });

  filteredVehicles = computed(() => {
    const term = this.search().toLowerCase().trim();
    let result = this.vehiclesView().filter((item) => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.plate.toLowerCase().includes(term) ||
        item.owner.toLowerCase().includes(term);
      const matchesStatus = !this.selectedStatus() || item.rawStatus === this.selectedStatus();
      return matchesSearch && matchesStatus;
    });

    if (this.selectedSort() === 'progress-desc') {
      result.sort((a, b) => b.progress - a.progress);
    } else if (this.selectedSort() === 'progress-asc') {
      result.sort((a, b) => a.progress - b.progress);
    }
    return result;
  });

  activeVehicleCount = computed(
    () =>
      this.vehicleStore.vehicles().filter((v) => v.status === VEHICLE_STATUS.IN_WORKSHOP).length,
  );
  readyVehicleCount = computed(
    () => this.vehicleStore.vehicles().filter((v) => v.status === VEHICLE_STATUS.READY).length,
  );

  openNew() {
    this.vehicle.set(this.getEmptyVehicle());
    this.isEditing.set(false);
    this.dialog.open(this.vehicleDialogTemplate, {
      width: '40rem',
      panelClass: 'custom-dialog-container',
    });
  }

  hideDialog() {
    this.dialog.closeAll();
  }

  editVehicleItem(selectedVehicle: Vehicle) {
    this.vehicle.set({ ...selectedVehicle, imageFile: null });
    this.isEditing.set(true);
    this.dialog.open(this.vehicleDialogTemplate, {
      width: '40rem',
      panelClass: 'custom-dialog-container',
    });
  }

  async saveVehicle() {
    try {
      const v = this.vehicle();
      if (v.plate && v.customerId) {
        if (v.id) {
          await this.vehicleStore.updateVehicle(v.id, v);
        } else {
          await this.vehicleStore.addVehicle(v);
        }
        this.hideDialog();
      }
    } catch (error) {
      console.error(error);
    }
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.vehicle.update((v) => ({ ...v, imageFile: file, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  viewVehicleDetail(selectedVehicle: Vehicle) {
    this.router.navigate([`/vehicles/${selectedVehicle.id}`]);
  }

  private getEmptyVehicle(): Vehicle {
    return {
      status: VEHICLE_STATUS.IN_WORKSHOP,
      plate: '',
      brand: '',
      model: '',
      year: '',
      color: '',
      image: '',
      imageFile: null,
      customerId: null,
    };
  }
}
