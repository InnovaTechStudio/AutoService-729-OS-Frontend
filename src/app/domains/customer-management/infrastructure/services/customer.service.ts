import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../domain/models/customer.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/customers`;

  getAll() {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  getById(id: string) {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  create(customer: Customer) {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  update(id: string, data: Partial<Customer>) {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
