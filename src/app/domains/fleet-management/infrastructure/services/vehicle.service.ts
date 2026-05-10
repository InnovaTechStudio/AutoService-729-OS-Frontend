import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Vehicle } from '../../domain/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/vehicles';

  getAll() { return this.http.get<Vehicle[]>(this.apiUrl); }
  getById(id: string) { return this.http.get<Vehicle>(`${this.apiUrl}/${id}`); }
  create(vehicle: Vehicle) { return this.http.post<Vehicle>(this.apiUrl, vehicle); }
  update(id: string, data: Partial<Vehicle>) { return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, data); }
}
