/**
 * MechanicService
 * 
 * Service of infrastructure responsible for managing all the operations
 * CRUD (Create, Read, Update, Delete) of mechanics against the backend
 * simulated (json-server).
 * 
 * @service
 * @providedIn 'root'
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mechanic } from '../../domain/models/mechanic.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MechanicService {

  private readonly http = inject(HttpClient);

  /** Base URL of the mechanics resource */
  private readonly apiUrl = `${environment.apiUrl}/mechanics`;

  /**
   * Gets the list of all registered mechanics.
   * @returns Observable with an array of Mechanic
   */
  getMechanics() {
    return this.http.get<Mechanic[]>(this.apiUrl);
  }

  /**
   * Creates a new mechanic in the system.
   * 
   * @param data Data of the mechanic to create
   * @returns Observable with the created mechanic
   */
  createMechanic(data: Mechanic) {
    return this.http.post<Mechanic>(this.apiUrl, data);
  }

  /**
   * Updates the information of an existing mechanic.
   * 
   * @param id ID of the mechanic to update
   * @param data Updated mechanic data
   * @returns Observable with the updated mechanic
   */
  updateMechanic(id: string, data: Mechanic) {
    return this.http.put<Mechanic>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Deletes a mechanic from the system.
   * 
   * @param id ID of the mechanic to delete
   */
  deleteMechanic(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}