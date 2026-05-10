import { Injectable, inject, signal } from '@angular/core';
import { VehicleService } from '../infrastructure/services/vehicle.service';
import { Vehicle } from '../domain/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleStore {
  private vehicleService = inject(VehicleService);

  readonly vehicles = signal<Vehicle[]>([]);
  readonly isLoading = signal<boolean>(false);

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

  addVehicle(vehicle: Vehicle) {
    this.vehicleService.create(vehicle).subscribe({
      next: (newVehicle) => this.vehicles.update(list => [...list, newVehicle]),
      error: (err) => console.error('Error al crear vehículo:', err)
    });
  }

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
