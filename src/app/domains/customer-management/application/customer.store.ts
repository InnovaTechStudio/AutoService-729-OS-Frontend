import { Injectable, inject, signal } from '@angular/core';
import { CustomerService } from '../infrastructure/services/customer.service';
import { Customer } from '../domain/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerStore {
  private customerService = inject(CustomerService);

  // Equivalente al state: () => ({ ... }) en Pinia
  readonly customers = signal<Customer[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Equivalente a fetchCustomers() en Pinia
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
      }
    });
  }

  // Equivalente a addCustomer() en Pinia
  addCustomer(customer: Customer) {
    this.customerService.create(customer).subscribe({
      next: (newCustomer) => {
        // Actualizamos la lista local agregando el nuevo cliente
        this.customers.update(list => [...list, newCustomer]);
      },
      error: (err) => console.error('Error al crear cliente:', err)
    });
  }

  // Equivalente a updateCustomer() en Pinia
  updateCustomer(id: string, customerData: Partial<Customer>) {
    this.customerService.update(id, customerData).subscribe({
      next: (updatedCustomer) => {
        // Buscamos el cliente en la lista y lo reemplazamos con la nueva data
        this.customers.update(list => {
          const index = list.findIndex(c => String(c.id) === String(id));
          if (index !== -1) {
            const newList = [...list];
            newList[index] = updatedCustomer;
            return newList;
          }
          return list;
        });
      },
      error: (err) => console.error('Error al actualizar cliente:', err)
    });
  }
}
