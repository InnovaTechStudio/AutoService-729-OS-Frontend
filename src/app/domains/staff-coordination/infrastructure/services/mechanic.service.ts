import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mechanic } from '../../domain/models/mechanic.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MechanicService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/mechanics`;

  getMechanics(): Observable<Mechanic[]> {
    return this.http.get<Mechanic[]>(this.apiUrl);
  }

  createMechanic(data: Mechanic): Observable<Mechanic> {
    return this.http.post<Mechanic>(this.apiUrl, data);
  }

  updateMechanic(id: string | number, data: Mechanic): Observable<Mechanic> {
    return this.http.put<Mechanic>(`${this.apiUrl}/${id}`, data);
  }

  deleteMechanic(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
