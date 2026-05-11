import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mechanic } from '../../domain/models/mechanic.model';

@Injectable({ providedIn: 'root' })
export class MechanicService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/mechanics';

  getMechanics() {
    return this.http.get<Mechanic[]>(this.apiUrl);
  }

  createMechanic(data: Mechanic) {
    return this.http.post<Mechanic>(this.apiUrl, data);
  }

  updateMechanic(id: string, data: Mechanic) {
    return this.http.put<Mechanic>(`${this.apiUrl}/${id}`, data);
  }

  deleteMechanic(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
