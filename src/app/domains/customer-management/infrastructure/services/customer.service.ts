/**
 *
 * CustomerService
 *
 * Service of infrastructure responsible for handling all operations
 * CRUD (Create, Read, Update, Delete) of customers against the backend.
 * Currently uses json-server as a simulated API.
 *
 * @service
 * @providedIn 'root'
 *
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../domain/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  /**
 * Base URL of the customers resource in json-server
 */
  private apiUrl = 'http://localhost:3000/customers';

  /**
 *
 * Gets all registered customers.
 * @returns Observable with an array of Customer
 *
 */
  getAll() { return this.http.get<Customer[]>(this.apiUrl); }

  /**
 *
 * Gets a customer by their ID.
 * @param id - ID of the customer
 * @returns Observable with the requested Customer
 *
 */
  getById(id: string) { return this.http.get<Customer>(`${this.apiUrl}/${id}`); }

  /**
 *
 * Creates a new customer.
 * @param customer - Data of the customer to create
 * @returns Observable with the created customer (including their ID)
 *
 */
  create(customer: Customer) { return this.http.post<Customer>(this.apiUrl, customer); }
  
  /**
 *
 * Updates the information of an existing customer.
 * @param id - ID of the customer to update
 * @param data - Partial customer data (Partial<Customer>)
 * @returns Observable with the updated customer
 *
 */
  update(id: string, data: Partial<Customer>) { return this.http.put<Customer>(`${this.apiUrl}/${id}`, data); }
}
