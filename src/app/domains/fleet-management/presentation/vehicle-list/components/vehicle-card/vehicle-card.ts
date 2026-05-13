/**
 * VehicleCardComponent
 *
 * Reusable card component responsible for displaying a vehicle summary.
 * It shows the vehicle image, name, owner, plate, year, color, status,
 * progress and action buttons for editing or viewing details.
 *
 * @component
 * @selector app-vehicle-card
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TranslateModule } from '@ngx-translate/core';

import { Vehicle } from '../../../../domain/models/vehicle.model';

/**
 * View model used by the vehicle card component.
 * It contains display-ready vehicle information and the original vehicle entity.
 */
export interface VehicleCardView {
  /**
   * Unique vehicle identifier.
   */
  id: string;

  /**
   * Original vehicle entity used for edit operations.
   */
  raw: Vehicle;

  /**
   * Vehicle display name.
   */
  name: string;

  /**
   * Vehicle license plate.
   */
  plate: string;

  /**
   * Vehicle owner name.
   */
  owner: string;

  /**
   * Current vehicle status.
   */
  status: string;

  /**
   * Current service progress percentage.
   */
  progress: number;

  /**
   * Vehicle manufacturing year.
   */
  year: string;

  /**
   * Vehicle color.
   */
  color: string;

  /**
   * Vehicle image URL.
   */
  image: string;
}

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslateModule
  ],
  templateUrl: './vehicle-card.html',
  styleUrl: './vehicle-card.css'
})
export class VehicleCardComponent {

  /**
   * Vehicle information displayed by the card.
   */
  @Input({ required: true }) vehicle!: VehicleCardView;

  /**
   * Event emitted when the user clicks the edit button.
   */
  @Output() edit = new EventEmitter<Vehicle>();

  /**
   * Event emitted when the user clicks the view details button.
   */
  @Output() viewDetails = new EventEmitter<VehicleCardView>();

  /**
   * Emits the original vehicle entity to be edited by the parent component.
   */
  protected onEdit(): void {
    this.edit.emit(this.vehicle.raw);
  }

  /**
   * Emits the selected vehicle card view to display its details.
   */
  protected onViewDetails(): void {
    this.viewDetails.emit(this.vehicle);
  }

  /**
   * Returns the CSS class used to style the vehicle status badge.
   *
   * @param status Current vehicle status.
   * @returns CSS class for the status badge.
   */
  protected getStatusClass(status: string): string {
    if (status === 'Listo') return 'badge-success';
    if (status === 'Entregado') return 'badge-info';
    if (status === 'En Taller') return 'badge-warning';

    return 'badge-secondary';
  }

  /**
   * Returns the translation key for the current vehicle status.
   *
   * @param status Current vehicle status.
   * @returns Translation key for the status label.
   */
  protected getStatusTranslationKey(status: string): string {
    if (status === 'Listo') return 'VEHICLE_CARD.STATUS.READY';
    if (status === 'Entregado') return 'VEHICLE_CARD.STATUS.DELIVERED';
    if (status === 'En Taller') return 'VEHICLE_CARD.STATUS.IN_WORKSHOP';

    return 'VEHICLE_CARD.STATUS.UNKNOWN';
  }
}