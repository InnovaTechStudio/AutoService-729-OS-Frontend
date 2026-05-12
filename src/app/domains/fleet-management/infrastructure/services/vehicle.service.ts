/**
 * VehicleService
 * 
 * Infrastructure service responsible for handling all CRUD operations
 * related to vehicles against the simulated backend (json-server).
 * 
 * @service
 * @providedIn 'root'
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Vehicle } from '../../domain/models/vehicle.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehicleService {

  private http = inject(HttpClient);

  /** Base URL of the vehicles resource */
  private apiUrl = `${environment.apiUrl}/vehicles`;

  /**
   * Gets all registered vehicles.
   * @returns Observable with an array of Vehicle
   */
  getAll() {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  /**
   * Gets a vehicle by its ID.
   * 
   * @param id ID of the vehicle
   * @returns Observable with the requested Vehicle
   */
  getById(id: string) {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new vehicle.
   * 
   * @param vehicle Data of the vehicle to register
   * @returns Observable with the created vehicle
   */
  create(vehicle: Vehicle) {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  /**
   * Updates an existing vehicle.
   * 
   * @param id ID of the vehicle to update
   * @param data Updated vehicle data
   * @returns Observable with the updated vehicle
   */
  update(id: string, data: Partial<Vehicle>) {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, data);
  }
}