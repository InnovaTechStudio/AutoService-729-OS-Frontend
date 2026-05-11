import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Vehicle } from '../../../../domain/models/vehicle.model';

export interface VehicleCardView {
  id: string;
  raw: Vehicle;
  name: string;
  plate: string;
  owner: string;
  status: string;
  progress: number;
  year: string;
  color: string;
  image: string;
}

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './vehicle-card.html',
  styleUrl: './vehicle-card.css'
})
export class VehicleCardComponent {
  @Input({ required: true }) vehicle!: VehicleCardView;

  @Output() edit = new EventEmitter<Vehicle>();
  @Output() viewDetails = new EventEmitter<VehicleCardView>();

  protected onEdit(): void {
    this.edit.emit(this.vehicle.raw);
  }

  protected onViewDetails(): void {
    this.viewDetails.emit(this.vehicle);
  }

  protected getStatusClass(status: string): string {
    if (status === 'Listo') return 'badge-success';
    if (status === 'Entregado') return 'badge-info';
    if (status === 'En Taller') return 'badge-warning';
    return 'badge-secondary';
  }
}
