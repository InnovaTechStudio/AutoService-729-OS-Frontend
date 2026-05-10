import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mechanic } from '../../domain/models/mechanic.model';

@Injectable({ providedIn: 'root' })
export class MechanicService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/mechanics';

  getAll() { return this.http.get<Mechanic[]>(this.apiUrl); }
  create(mechanic: Mechanic) { return this.http.post<Mechanic>(this.apiUrl, mechanic); }
}
