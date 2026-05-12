/**
 * VehicleStore
 * 
 * Signals-based reactive store that manages vehicle status
 * from the workshop. It acts as an application layer between the components and the
 * VehicleService.
 * 
 * @service
 * @providedIn 'root'
 */

import { Injectable, inject, signal } from '@angular/core';
import { VehicleService } from '../infrastructure/services/vehicle.service';
import { Vehicle } from '../domain/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleStore {
  private vehicleService = inject(VehicleService);

  /** Reactive list of all vehicles */
  readonly vehicles = signal<Vehicle[]>([]);
  /** Indicates if vehicle information is being loaded */
  readonly isLoading = signal<boolean>(false);

  /**
   * Load all vehicles from the backend and update the `vehicles` signal.
   */
  loadVehicles() {
    this.isLoading.set(true);
    this.vehicleService.getAll().subscribe({
      next: (data) => {
        this.vehicles.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Register a new vehicle in the system.
   * 
   * @param vehicle - Data of the vehicle to create
   */
  addVehicle(vehicle: Vehicle) {
    this.vehicleService.create(vehicle).subscribe({
      next: (newVehicle) => this.vehicles.update(list => [...list, newVehicle]),
      error: (err) => console.error('Error al crear vehículo:', err)
    });
  }

  /**
   * Updates the information of an existing vehicle.
   * 
   * @param id - ID of the vehicle to update
   * @param vehicleData - Partial vehicle data
   */
  updateVehicle(id: string, vehicleData: Partial<Vehicle>) {
    this.vehicleService.update(id, vehicleData).subscribe({
      next: (updatedVehicle) => {
        this.vehicles.update(list => {
          const index = list.findIndex(v => String(v.id) === String(id));
          if (index !== -1) {
            const newList = [...list];
            newList[index] = updatedVehicle;
            return newList;
          }
          return list;
        });
      },
      error: (err) => console.error('Error al actualizar vehículo:', err)
    });
  }
}
