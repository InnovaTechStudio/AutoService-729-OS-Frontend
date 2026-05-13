/**
 * VehicleListComponent
 *
 * Main component responsible for managing and displaying the vehicle list
 * in the workshop administration panel.
 *
 * It allows users to:
 * - Display vehicles in card format.
 * - Filter vehicles by search text and status.
 * - Create new vehicles.
 * - Edit existing vehicles through a modal dialog.
 * - Navigate to the detail page of each vehicle.
 *
 * The component uses Angular Signals and computed values to manage
 * filtering and derived UI data reactively.
 *
 * @component
 * @selector app-vehicle-list
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CustomerStore } from '../../../customer-management/application/customer.store';
import { VehicleStore } from '../../application/vehicle.store';
import { Vehicle } from '../../domain/models/vehicle.model';
import { VehicleCardComponent, VehicleCardView } from './components/vehicle-card/vehicle-card';
import { VehicleFiltersComponent } from './components/vehicle-filters/vehicle-filters';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule,
    VehicleCardComponent,
    VehicleFiltersComponent
  ],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.css'
})
export class VehicleListComponent implements OnInit {

  protected readonly vehicleStore = inject(VehicleStore);
  protected readonly customerStore = inject(CustomerStore);

  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  /**
   * Reference to the vehicle creation/editing dialog template.
   */
  @ViewChild('vehicleDialog') vehicleDialogTemplate!: TemplateRef<unknown>;

  /**
   * Vehicle currently being created or edited.
   */
  protected currentVehicle: Vehicle = this.getEmptyVehicle();

  /**
   * Indicates whether the dialog is being used to edit an existing vehicle.
   */
  protected isEditing = false;

  /**
   * Search term entered by the user.
   */
  protected readonly search = signal('');

  /**
   * Selected vehicle status used by the status filter.
   */
  protected readonly selectedStatus = signal<string | null>(null);

  /**
   * Available vehicle status options.
   */
  protected readonly statusOptions = ['En Taller', 'Listo', 'Entregado'];

  /**
   * Backup vehicle images used when the vehicle has no image assigned.
   */
  private readonly carImages = [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop'
  ];

  /**
   * Display-ready vehicle list used by vehicle cards.
   */
  protected readonly vehiclesView = computed<VehicleCardView[]>(() =>
    this.vehicleStore.vehicles().map((item, index) => ({
      id: String(item.id ?? index),
      raw: item,
      name: `${item.brand || this.translate.instant('VEHICLE_LIST.DEFAULT_VEHICLE')} ${item.model || ''}`,
      plate: item.plate || this.translate.instant('VEHICLE_LIST.NO_PLATE'),
      owner: this.getCustomerName(item.customerId),
      status: item.status || 'En Taller',
      progress: this.getProgress(item.status),
      year: item.year || 'N/A',
      color: item.color || 'N/A',
      image: this.carImages[index % this.carImages.length]
    }))
  );

  /**
   * Filtered vehicle list based on the search term and selected status.
   */
  protected readonly filteredVehicles = computed(() => {
    const term = this.search().toLowerCase().trim();
    const selectedStatus = this.selectedStatus();

    return this.vehiclesView().filter((item) => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.plate.toLowerCase().includes(term) ||
        item.owner.toLowerCase().includes(term);

      const matchesStatus =
        !selectedStatus || item.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  });

  /**
   * Number of vehicles currently in the workshop.
   */
  protected readonly vehiclesInWorkshop = computed(() =>
    this.vehicleStore.vehicles().filter((vehicle) => vehicle.status === 'En Taller').length
  );

  /**
   * Number of vehicles ready for delivery.
   */
  protected readonly readyVehicles = computed(() =>
    this.vehicleStore.vehicles().filter((vehicle) => vehicle.status === 'Listo').length
  );

  /**
   * Loads vehicles and customers when the component is initialized.
   */
  ngOnInit(): void {
    this.vehicleStore.loadVehicles();

    if (this.customerStore.customers().length === 0) {
      this.customerStore.loadCustomers();
    }
  }

  /**
   * Updates the search term used to filter vehicles.
   *
   * @param value Text entered in the search field.
   */
  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  /**
   * Updates the selected status used to filter vehicles.
   *
   * @param value Selected vehicle status or null to show all vehicles.
   */
  protected onStatusChange(value: string | null): void {
    this.selectedStatus.set(value);
  }

  /**
   * Opens the dialog to register a new vehicle.
   */
  protected openNewDialog(): void {
    this.currentVehicle = this.getEmptyVehicle();
    this.isEditing = false;
    this.dialog.open(this.vehicleDialogTemplate, { width: '560px' });
  }

  /**
   * Opens the dialog to edit an existing vehicle.
   *
   * @param vehicle Vehicle selected for editing.
   */
  protected editVehicle(vehicle: Vehicle): void {
    this.currentVehicle = { ...vehicle };
    this.isEditing = true;
    this.dialog.open(this.vehicleDialogTemplate, { width: '560px' });
  }

  /**
   * Closes the vehicle creation/editing dialog.
   */
  protected closeDialog(): void {
    this.dialog.closeAll();
  }

  /**
   * Saves a new vehicle or updates an existing one.
   */
  protected saveVehicle(): void {
    if (!this.currentVehicle.plate || !this.currentVehicle.customerId) {
      return;
    }

    if (this.isEditing && this.currentVehicle.id) {
      this.vehicleStore.updateVehicle(this.currentVehicle.id, this.currentVehicle);
    } else {
      this.vehicleStore.addVehicle(this.currentVehicle);
    }

    this.closeDialog();
  }

  /**
   * Navigates to the detail page of the selected vehicle.
   *
   * @param vehicle Selected vehicle card view.
   */
  protected goToVehicleDetails(vehicle: VehicleCardView): void {
    this.router.navigate(['/admin/vehicles', vehicle.id]);
  }

  /**
   * Gets the full name of the owner assigned to the vehicle.
   *
   * @param customerId Customer identifier.
   * @returns Customer full name or translated unassigned label.
   */
  protected getCustomerName(customerId: string): string {
    const customer = this.customerStore
      .customers()
      .find((item) => String(item.id) === String(customerId));

    return customer ? customer.fullName : this.translate.instant('VEHICLE_LIST.UNASSIGNED');
  }

  /**
   * Returns the translation key for a vehicle status.
   *
   * @param status Vehicle status value.
   * @returns Translation key for the status label.
   */
  protected getStatusTranslationKey(status: string): string {
    if (status === 'En Taller') return 'VEHICLE_LIST.STATUS_OPTIONS.IN_WORKSHOP';
    if (status === 'Listo') return 'VEHICLE_LIST.STATUS_OPTIONS.READY';
    if (status === 'Entregado') return 'VEHICLE_LIST.STATUS_OPTIONS.DELIVERED';

    return 'VEHICLE_LIST.STATUS_OPTIONS.UNKNOWN';
  }

  /**
   * Returns the progress percentage according to the vehicle status.
   *
   * @param status Vehicle status value.
   * @returns Progress percentage.
   */
  private getProgress(status: string): number {
    switch (status) {
      case 'En Taller':
        return 65;

      case 'Listo':
      case 'Entregado':
        return 100;

      default:
        return 15;
    }
  }

  /**
   * Returns an empty vehicle object used to initialize the form.
   *
   * @returns Empty vehicle object.
   */
  private getEmptyVehicle(): Vehicle {
    return {
      plate: '',
      brand: '',
      model: '',
      year: '',
      color: '',
      status: 'En Taller',
      customerId: ''
    };
  }
}