/**
 *
 * CustomerStore (Customer Warehouse)
 *
 * Signals-based reactive status service that manages information
 * about the customers of the workshop. It acts as an intermediate layer between the components
 * and the CustomerService (infrastructure layer).
 *
 * Uses Signals for modern, lightweight and reactive state management.
 *
 * @service
 * @providedIn 'root'
 *
 */
import { Injectable, inject, signal } from '@angular/core';
import { CustomerService } from '../infrastructure/services/customer.service';
import { Customer } from '../domain/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerStore {
  private customerService = inject(CustomerService);

  /**
 *
 * Equivalent to state: () => ({ ... }) in Pinia
 * Reactive list of all customers
 *
 */
  readonly customers = signal<Customer[]>([]);
  /**
 * Indicates if information about customers is being loaded
 */
  readonly isLoading = signal<boolean>(false);

  /**
 *
 * Equivalent to fetchCustomers() in Pinia
 *
 * Loads all customers from the backend and updates the `customers` signal.
 *
 * Automatically updates the loading state (`isLoading`).
 *
 */
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

  /**
 *
 * Add a new client to the system.
 *
 * @param customer - Customer data to be created
 *
 */
  addCustomer(customer: Customer) {
    this.customerService.create(customer).subscribe({
      next: (newCustomer) => {
        // We updated the local list by adding the new client.
        this.customers.update(list => [...list, newCustomer]);
      },
      error: (err) => console.error('Error al crear cliente:', err)
    });
  }

  /**
 *
 * Updates the information of an existing customer.
 *
 * @param id - ID of the customer to update
 * @param customerData - Partial customer data (Partial<Customer>)
 *
 */
  updateCustomer(id: string, customerData: Partial<Customer>) {
    this.customerService.update(id, customerData).subscribe({
      next: (updatedCustomer) => {
        /**
 * We search for the customer in the list and replace it with the new data
 */
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
  deleteCustomer(id: string): void {
    this.customerService.delete(id).subscribe({
      next: () => {
        this.customers.update(list =>
          list.filter(customer => String(customer.id) !== String(id))
        );
      },
      error: (err) => console.error('Error eliminando cliente', err)
    });
  }

}
