import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select'; // <-- Para los Dropdowns

import { VehicleStore } from '../../application/vehicle.store';
import { CustomerStore } from '../../../customer-management/application/customer.store';
import { Vehicle } from '../../domain/models/vehicle.model';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatSelectModule
  ],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.css'
})
export class VehicleListComponent implements OnInit {
  vehicleStore = inject(VehicleStore);
  customerStore = inject(CustomerStore); // Inyectamos el de clientes para los dueños
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['plate', 'brand', 'model', 'year', 'color', 'owner', 'status', 'actions'];

  @ViewChild('vehicleDialog') vehicleDialogTemplate!: TemplateRef<any>;

  currentVehicle: Vehicle = this.getEmptyVehicle();
  isEditing = false;
  statusOptions = ['En Taller', 'Listo', 'Entregado'];

  ngOnInit() {
    this.vehicleStore.loadVehicles();
    // Cargamos los clientes por si acaso aún no se han cargado en la sesión
    if (this.customerStore.customers().length === 0) {
      this.customerStore.loadCustomers();
    }
  }

  // Busca el nombre cruzando el ID con el array de clientes
  getCustomerName(customerId: string): string {
    const customer = this.customerStore.customers().find(c => String(c.id) === String(customerId));
    return customer ? customer.fullName : 'No asignado';
  }

  // Asigna un color según el estado (equivalente a los severities de PrimeVue)
  getStatusClass(status: string): string {
    if (status === 'Listo') return 'badge-success';
    if (status === 'Entregado') return 'badge-info';
    return 'badge-warning'; // En Taller
  }

  openNewDialog() {
    this.currentVehicle = this.getEmptyVehicle();
    this.isEditing = false;
    this.dialog.open(this.vehicleDialogTemplate, { width: '500px' });
  }

  editVehicle(vehicle: Vehicle) {
    this.currentVehicle = { ...vehicle };
    this.isEditing = true;
    this.dialog.open(this.vehicleDialogTemplate, { width: '500px' });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  saveVehicle() {
    if (this.currentVehicle.plate && this.currentVehicle.customerId) {
      if (this.isEditing && this.currentVehicle.id) {
        this.vehicleStore.updateVehicle(this.currentVehicle.id, this.currentVehicle);
      } else {
        this.vehicleStore.addVehicle(this.currentVehicle);
      }
      this.closeDialog();
    }
  }

  private getEmptyVehicle(): Vehicle {
    return { plate: '', brand: '', model: '', year: '', color: '', status: 'En Taller', customerId: '' };
  }
}
