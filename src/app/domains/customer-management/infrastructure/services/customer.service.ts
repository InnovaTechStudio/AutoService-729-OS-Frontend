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
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService {

  private http = inject(HttpClient);

  /**
   * Base URL of the customers resource
   */
  private apiUrl = `${environment.apiUrl}/customers`;

  /**
   *
   * Gets all registered customers.
   * @returns Observable with an array of Customer
   *
   */
  getAll() {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  /**
   *
   * Gets a customer by their ID.
   * @param id - ID of the customer
   * @returns Observable with the requested Customer
   *
   */
  getById(id: string) {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  /**
   *
   * Creates a new customer.
   * @param customer - Data of the customer to create
   * @returns Observable with the created customer
   *
   */
  create(customer: Customer) {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  /**
   *
   * Updates the information of an existing customer.
   * @param id - ID of the customer to update
   * @param data - Partial customer data
   * @returns Observable with the updated customer
   *
   */
  update(id: string, data: Partial<Customer>) {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, data);
  }

  /**
   *
   * Deletes a customer by ID.
   * @param id - ID of the customer
   * @returns Observable<void>
   *
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}