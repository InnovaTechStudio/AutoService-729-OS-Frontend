/**
 *
 * CustomerListComponent
 *
 * Component responsible for displaying the customer list in a table
 * Using Angular Material. Allows you to create new clients and edit
 * existing ones through a modal.
 *
 * @component
 * @selector app-customer-list
 * @standalone true
 *
 */

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
  /**
 * We injected the Store and the Material Modals service
 */
  customerStore = inject(CustomerStore);
  private dialog = inject(MatDialog);

  /**
 * Columns that will be displayed in the Material table
 */
  displayedColumns: string[] = ['fullName', 'dni', 'email', 'phone', 'actions'];

  /**
 * Reference to the modal template defined in the HTML
 */
  @ViewChild('customerDialog') customerDialogTemplate!: TemplateRef<any>;

  /**
 * Customer currently being edited or created
 */
  currentCustomer: Customer = this.getEmptyCustomer();
  /**
 * Indicates if an existing customer is being edited
 */
  isEditing = false;

  ngOnInit() {
    // When loading the component, we tell the store to fetch the data
    this.customerStore.loadCustomers();
  }

  /**
* 
 * Opens the modal to create a new customer.
 *
 */
  openNewCustomerDialog() {
    this.currentCustomer = this.getEmptyCustomer();
    this.isEditing = false;
    this.dialog.open(this.customerDialogTemplate, { width: '450px' });
  }

  /**
 * Opens the modal to edit an existing customer.
 * @param customer - Customer to edit
 *
 */
  editCustomer(customer: Customer) {
    this.currentCustomer = { ...customer }; // Clonamos para no editar directamente
    this.isEditing = true;
    this.dialog.open(this.customerDialogTemplate, { width: '450px' });
  }

  /**
 *
 * Closes all open modals.
 *
 */
  closeDialog() {
    this.dialog.closeAll();
  }

  /**
 *
 * Saves or updates the customer based on the mode (create/edit).
 *
 */
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

  /**
 *
 * Returns an empty Customer object for new records.
 * @returns Empty Customer
 *
 */
  private getEmptyCustomer(): Customer {
    return { fullName: '', dni: '', email: '', phone: '' };
  }
}
