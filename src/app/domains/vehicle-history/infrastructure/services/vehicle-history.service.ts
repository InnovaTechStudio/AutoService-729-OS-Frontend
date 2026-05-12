import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VehicleHistory } from '../../domain/models/vehicle-history.model';

@Injectable({ providedIn: 'root' })
export class VehicleHistoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/vehicle-history';

  getHistoryByVehicleId(vehicleId: string) {
    return this.http.get<VehicleHistory[]>(`${this.apiUrl}?vehicleId=${vehicleId}`);
  }

  getHistoryByPlate(plate: string) {
    return this.http.get<VehicleHistory[]>(`${this.apiUrl}?plate=${plate}`);
  }

  createHistoryRecord(data: VehicleHistory) {
    return this.http.post<VehicleHistory>(this.apiUrl, data);
  }
}
