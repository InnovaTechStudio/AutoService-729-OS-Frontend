import { inject, Injectable, signal } from '@angular/core';
import { VehicleHistoryService } from '../infrastructure/services/vehicle-history.service';
import { VehicleHistory } from '../domain/models/vehicle-history.model';

@Injectable({ providedIn: 'root' })
export class VehicleHistoryStore {
  private readonly service = inject(VehicleHistoryService);

  readonly history = signal<VehicleHistory[]>([]);
  readonly isLoading = signal(false);

  loadByVehicleId(vehicleId: string): void {
    this.isLoading.set(true);

    this.service.getHistoryByVehicleId(vehicleId).subscribe({
      next: (data) => {
        this.history.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading vehicle history by vehicleId:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadByPlate(plate: string): void {
    this.isLoading.set(true);

    this.service.getHistoryByPlate(plate).subscribe({
      next: (data) => {
        this.history.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading vehicle history by plate:', error);
        this.isLoading.set(false);
      }
    });
  }

  createHistoryRecord(record: VehicleHistory): void {
    this.service.createHistoryRecord(record).subscribe({
      next: (createdRecord) => {
        this.history.update((current) => [...current, createdRecord]);
      },
      error: (error) => console.error('Error creating vehicle history record:', error)
    });
  }
}
