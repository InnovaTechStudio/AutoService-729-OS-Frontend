/**
 * VehicleListComponent
 * 
 * Main component for managing and displaying the vehicle list
 * from the workshop. It allows:
 * - Display all vehicles in card format (`VehicleCardComponent`)
 * - Filter by textual search and status
 * - Create new vehicles
 * - Edit existing vehicles through a modal
 * - Navigate to the detail of each vehicle
 * 
 * Uses Signals and `computed()` to manage the state and filters in a
 * reactive and efficient manner.
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

  /** Reference to the template of the vehicle creation/editing modal */
  @ViewChild('vehicleDialog') vehicleDialogTemplate!: TemplateRef<unknown>;

  /** Current vehicle being created or edited */
  protected currentVehicle: Vehicle = this.getEmptyVehicle();
  protected isEditing = false;

  /** Search term entered by the user */
  protected readonly search = signal('');

  /** Selected status for filtering vehicles */
  protected readonly selectedStatus = signal<string | null>(null);

  /** Available options for filtering by status */
  protected readonly statusOptions = ['En Taller', 'Listo', 'Entregado'];

  /** Backup vehicle images (Unsplash) */
  private readonly carImages = [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop'
  ];

  /** Enriched view of the vehicles to display in the cards */
  protected readonly vehiclesView = computed<VehicleCardView[]>(() =>
    this.vehicleStore.vehicles().map((item, index) => ({
      id: String(item.id ?? index),
      raw: item,
      name: `${item.brand || 'Vehículo'} ${item.model || ''}`,
      plate: item.plate || 'Sin placa',
      owner: this.getCustomerName(item.customerId),
      status: item.status || 'En Taller',
      progress: this.getProgress(item.status),
      year: item.year || 'N/A',
      color: item.color || 'N/A',
      image: this.carImages[index % this.carImages.length]
    }))
  );

  /** Filtered list of vehicles based on search and status */
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

  /** Count of vehicles currently in the workshop */
  protected readonly vehiclesInWorkshop = computed(() =>
    this.vehicleStore.vehicles().filter((vehicle) => vehicle.status === 'En Taller').length
  );

  /** Count of vehicles ready for delivery */
  protected readonly readyVehicles = computed(() =>
    this.vehicleStore.vehicles().filter((vehicle) => vehicle.status === 'Listo').length
  );

  ngOnInit(): void {
    this.vehicleStore.loadVehicles();

    // Load clients only if they are not loaded
    if (this.customerStore.customers().length === 0) {
      this.customerStore.loadCustomers();
    }
  }

  /**
   * Updates the search term.
   * @param value - Text entered in the search field
   */
  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  /**
   * Updates the selected status filter.
   * @param value - Selected status
   */
  protected onStatusChange(value: string | null): void {
    this.selectedStatus.set(value);
  }

  /**
   * Opens the modal to register a new vehicle.
   */
  protected openNewDialog(): void {
    this.currentVehicle = this.getEmptyVehicle();
    this.isEditing = false;
    this.dialog.open(this.vehicleDialogTemplate, { width: '560px' });
  }

  /**
   * Opens the modal to edit an existing vehicle.
   * @param vehicle - Vehicle to edit
   */
  protected editVehicle(vehicle: Vehicle): void {
    this.currentVehicle = { ...vehicle };
    this.isEditing = true;
    this.dialog.open(this.vehicleDialogTemplate, { width: '560px' });
  }

  /**
   * Closes the creation/editing modal.
   */
  protected closeDialog(): void {
    this.dialog.closeAll();
  }

  /**
   * Saves or updates a vehicle based on the mode (create or edit).
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
   * Browse to the complete details of the selected vehicle.
   * @param vehicle - View of the selected vehicle
   */
  protected goToVehicleDetails(vehicle: VehicleCardView): void {
    this.router.navigate(['/admin/vehicles', vehicle.id]);
  }

  /**
   * Gets the name of the owner client.
   * @param customerId - ID of the client
   * @returns Full name or "Not assigned"
   */
  protected getCustomerName(customerId: string): string {
    const customer = this.customerStore
      .customers()
      .find((item) => String(item.id) === String(customerId));

    return customer ? customer.fullName : 'No asignado';
  }

  /**
   * Returns the progress percentage based on the vehicle's status.
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
   * Returns an empty Vehicle object to initialize forms.
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
