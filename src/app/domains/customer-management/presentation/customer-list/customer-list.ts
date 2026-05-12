import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CustomerStore } from '../../application/customer.store';
import { Customer } from '../../domain/models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatInputModule, MatFormFieldModule
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerListComponent implements OnInit {
  // Inyectamos el Store y el servicio de Modales de Material
  customerStore = inject(CustomerStore);
  private dialog = inject(MatDialog);

  // Columnas que se mostrarán en la tabla
  displayedColumns: string[] = ['fullName', 'dni', 'email', 'phone', 'actions'];

  // Referencia al template del modal en el HTML
  @ViewChild('customerDialog') customerDialogTemplate!: TemplateRef<any>;

  // Estado del formulario
  currentCustomer: Customer = this.getEmptyCustomer();
  isEditing = false;

  ngOnInit() {
    // Al cargar el componente, le decimos al store que traiga los datos
    this.customerStore.loadCustomers();
  }

  openNewCustomerDialog() {
    this.currentCustomer = this.getEmptyCustomer();
    this.isEditing = false;
    this.dialog.open(this.customerDialogTemplate, { width: '450px' });
  }

  editCustomer(customer: Customer) {
    this.currentCustomer = { ...customer }; // Clonamos para no editar directamente
    this.isEditing = true;
    this.dialog.open(this.customerDialogTemplate, { width: '450px' });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  saveCustomer() {
    if (this.currentCustomer.fullName && this.currentCustomer.dni) {
      if (this.isEditing && this.currentCustomer.id) {
        this.customerStore.updateCustomer(this.currentCustomer.id, this.currentCustomer);
      } else {
        this.customerStore.addCustomer(this.currentCustomer);
      }
      this.closeDialog();
    }
  }
  protected deleteCustomer(id: string): void {

    const confirmed = window.confirm(
      '¿Deseas eliminar este cliente?'
    );
    if (!confirmed) return;
    this.customerStore.deleteCustomer(id);
  }

  private getEmptyCustomer(): Customer {
    return { fullName: '', dni: '', email: '', phone: '' };
  }
}
