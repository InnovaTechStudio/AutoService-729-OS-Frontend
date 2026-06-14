import { Injectable, inject, signal } from '@angular/core';
import { CustomerService } from '../infrastructure/services/customer.service';
import { Customer } from '../domain/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerStore {
  private customerService = inject(CustomerService);

  readonly customers = signal<Customer[]>([]);
  readonly isLoading = signal<boolean>(false);

  loadCustomers() {
    this.isLoading.set(true);
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.isLoading.set(false);
      },
    });
  }

  addCustomer(customer: Customer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.customerService.create(customer).subscribe({
        next: (newCustomer) => {
          this.customers.update((list) => [...list, newCustomer]);
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  updateCustomer(id: string | number, customerData: Partial<Customer>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.customerService.update(id, customerData).subscribe({
        next: (updatedCustomer) => {
          this.customers.update((list) => list.map((c) => (c.id === id ? updatedCustomer : c)));
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  deleteCustomer(id: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.customerService.delete(id).subscribe({
        next: () => {
          this.customers.update((list) => list.filter((c) => c.id !== id));
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }
}
