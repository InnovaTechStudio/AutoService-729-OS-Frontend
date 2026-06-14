import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { InventoryItem } from '../../domain/models/inventory-item.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/inventory-items`;

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl);
  }

  getById(id: string | number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`);
  }

  create(data: InventoryItem): Observable<InventoryItem> {
    const payload = { ...data, image: data.image || '' };
    return this.http.post<InventoryItem>(this.apiUrl, payload);
  }

  update(id: string | number, data: InventoryItem): Observable<InventoryItem> {
    const payload = { ...data, image: data.image || '' };
    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
