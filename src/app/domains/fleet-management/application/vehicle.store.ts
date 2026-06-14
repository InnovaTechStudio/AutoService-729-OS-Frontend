import { Injectable, inject, signal } from '@angular/core';
import { VehicleService } from '../infrastructure/services/vehicle.service';
import { Vehicle } from '../domain/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleStore {
  private vehicleService = inject(VehicleService);

  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal<boolean>(false);

  loadVehicles(): Promise<void> {
    this.loading.set(true);
    return new Promise((resolve, reject) => {
      this.vehicleService.getAll().subscribe({
        next: (data) => {
          this.vehicles.set(data);
          this.loading.set(false);
          resolve();
        },
        error: (err) => {
          console.error('vehicles.errors.load', err);
          this.loading.set(false);
          reject(err);
        },
      });
    });
  }

  addVehicle(vehicle: Vehicle): Promise<Vehicle> {
    return new Promise((resolve, reject) => {
      this.vehicleService.create(vehicle).subscribe({
        next: (newVehicle) => {
          this.vehicles.update((list) => [...list, newVehicle]);
          resolve(newVehicle);
        },
        error: (err) => {
          console.error('vehicles.errors.create', err);
          reject(err);
        },
      });
    });
  }

  updateVehicle(id: string | number, vehicleData: Partial<Vehicle>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.vehicleService.update(id, vehicleData).subscribe({
        next: (updatedVehicle) => {
          this.vehicles.update((list) =>
            list.map((v) => (String(v.id) === String(id) ? updatedVehicle : v)),
          );
          resolve();
        },
        error: (err) => {
          console.error('vehicles.errors.update', err);
          reject(err);
        },
      });
    });
  }
}
