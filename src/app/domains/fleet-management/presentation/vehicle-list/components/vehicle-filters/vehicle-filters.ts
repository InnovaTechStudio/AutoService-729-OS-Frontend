/**
 * VehicleFiltersComponent
 *
 * Reusable filter component for the vehicle management page.
 * It allows the user to filter vehicles by search text and by status.
 * The component receives the current filter values from the parent
 * and emits changes whenever the user updates them.
 *
 * @component
 * @selector app-vehicle-filters
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicle-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './vehicle-filters.html',
  styleUrl: './vehicle-filters.css'
})
export class VehicleFiltersComponent {

  /**
   * Current search text used to filter vehicles.
   */
  @Input() search = '';

  /**
   * Current selected vehicle status.
   * A null value means that all statuses are selected.
   */
  @Input() status: string | null = null;

  /**
   * List of available status options received from the parent component.
   */
  @Input() statusOptions: string[] = [];

  /**
   * Event emitted when the search text changes.
   */
  @Output() searchChange = new EventEmitter<string>();

  /**
   * Event emitted when the selected status changes.
   */
  @Output() statusChange = new EventEmitter<string | null>();

  /**
   * Emits the updated search text to the parent component.
   *
   * @param value New search text.
   */
  protected onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  /**
   * Emits the updated selected status to the parent component.
   *
   * @param value New selected status or null when all statuses are selected.
   */
  protected onStatusChange(value: string | null): void {
    this.statusChange.emit(value);
  }

  /**
   * Returns the translation key for a vehicle status option.
   *
   * @param status Vehicle status value.
   * @returns Translation key for the status label.
   */
  protected getStatusTranslationKey(status: string): string {
    if (status === 'Listo') return 'VEHICLE_FILTERS.STATUS.READY';
    if (status === 'Entregado') return 'VEHICLE_FILTERS.STATUS.DELIVERED';
    if (status === 'En Taller') return 'VEHICLE_FILTERS.STATUS.IN_WORKSHOP';

    return 'VEHICLE_FILTERS.STATUS.UNKNOWN';
  }
}