import { Component, inject, OnInit, TemplateRef, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

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
    TranslatePipe,
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerListComponent implements OnInit {
  customerStore = inject(CustomerStore);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  displayedColumns: string[] = ['fullName', 'dni', 'email', 'phone', 'actions'];

  searchTerm = signal('');

  filteredCustomers = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const customers = this.customerStore.customers();
    if (!search) return customers;

    return customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.dni.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search),
    );
  });

  @ViewChild('customerFormDialog') customerDialogTemplate!: TemplateRef<any>;
  @ViewChild('deleteConfirmDialog') deleteDialogTemplate!: TemplateRef<any>;

  customerForm: Customer = this.getEmptyCustomer();
  editMode = false;
  selectedCustomerId: string | number | null = null;

  ngOnInit() {
    this.customerStore.loadCustomers();
  }

  openAddModal() {
    this.editMode = false;
    this.customerForm = this.getEmptyCustomer();
    this.dialog.open(this.customerDialogTemplate, {
      width: '40rem',
      panelClass: 'custom-dialog-container',
    });
  }

  openEditModal(customer: Customer) {
    this.editMode = true;
    this.selectedCustomerId = customer.id!;
    this.customerForm = { ...customer };
    this.dialog.open(this.customerDialogTemplate, {
      width: '40rem',
      panelClass: 'custom-dialog-container',
    });
  }

  async saveCustomer() {
    try {
      if (this.editMode && this.selectedCustomerId) {
        await this.customerStore.updateCustomer(this.selectedCustomerId, this.customerForm);
      } else {
        await this.customerStore.addCustomer(this.customerForm);
      }
      this.dialog.closeAll();
    } catch (error) {
      alert(this.translate.instant('customers.errors.createError'));
    }
  }

  openDeleteModal(customer: Customer) {
    this.selectedCustomerId = customer.id!;
    this.customerForm = { ...customer };
    this.dialog.open(this.deleteDialogTemplate, {
      width: '28rem',
      disableClose: true,
      panelClass: 'custom-dialog-container',
    });
  }

  async confirmDelete() {
    if (!this.selectedCustomerId) return;
    try {
      await this.customerStore.deleteCustomer(this.selectedCustomerId);
      this.dialog.closeAll();
    } catch (error) {
      alert(this.translate.instant('customers.errors.deleteError'));
    }
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  private getEmptyCustomer(): Customer {
    return { fullName: '', dni: '', email: '', phone: '' };
  }
}
