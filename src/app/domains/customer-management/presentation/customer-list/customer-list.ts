/**
 * CustomerListComponent
 *
 * Component responsible for displaying the customer list in a table
 * using Angular Material. It allows users to create, edit and delete
 * customers through a modal dialog.
 *
 * @component
 * @selector app-customer-list
 * @standalone true
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

// ngx-translate
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CustomerStore } from '../../application/customer.store';
import { Customer } from '../../domain/models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    TranslateModule
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerListComponent implements OnInit {

  /**
   * Store used to manage customer data.
   */
  customerStore = inject(CustomerStore);

  /**
   * Angular Material dialog service.
   */
  private dialog = inject(MatDialog);

  /**
   * Translation service used for messages generated from TypeScript.
   */
  private translate = inject(TranslateService);

  /**
   * Columns displayed in the Angular Material table.
   */
  displayedColumns: string[] = ['fullName', 'dni', 'email', 'phone', 'actions'];

  /**
   * Reference to the modal template defined in the HTML.
   */
  @ViewChild('customerDialog') customerDialogTemplate!: TemplateRef<any>;

  /**
   * Customer currently being created or edited.
   */
  currentCustomer: Customer = this.getEmptyCustomer();

  /**
   * Indicates whether an existing customer is being edited.
   */
  isEditing = false;

  /**
   * Loads the customer data when the component is initialized.
   */
  ngOnInit(): void {
    this.customerStore.loadCustomers();
  }

  /**
   * Opens the modal to create a new customer.
   */
  openNewCustomerDialog(): void {
    this.currentCustomer = this.getEmptyCustomer();
    this.isEditing = false;
    this.dialog.open(this.customerDialogTemplate, { width: '450px' });
  }

  /**
   * Opens the modal to edit an existing customer.
   *
   * @param customer Customer selected for editing.
   */
  editCustomer(customer: Customer): void {
    this.currentCustomer = { ...customer };
    this.isEditing = true;
    this.dialog.open(this.customerDialogTemplate, { width: '450px' });
  }

  /**
   * Closes all open dialogs.
   */
  closeDialog(): void {
    this.dialog.closeAll();
  }

  /**
   * Saves a new customer or updates an existing one.
   */
  saveCustomer(): void {
    if (this.currentCustomer.fullName && this.currentCustomer.dni) {
      if (this.isEditing && this.currentCustomer.id) {
        this.customerStore.updateCustomer(this.currentCustomer.id, this.currentCustomer);
      } else {
        this.customerStore.addCustomer(this.currentCustomer);
      }

      this.closeDialog();
    }
  }

  /**
   * Deletes a customer after user confirmation.
   *
   * @param id Customer identifier.
   */
  protected deleteCustomer(id: string): void {
    const confirmed = window.confirm(
      this.translate.instant('CUSTOMERS.DELETE_CONFIRM')
    );

    if (!confirmed) return;

    this.customerStore.deleteCustomer(id);
  }

  /**
   * Returns an empty customer object for new records.
   *
   * @returns Empty customer object.
   */
  private getEmptyCustomer(): Customer {
    return { fullName: '', dni: '', email: '', phone: '' };
  }
}