/**
 * MechanicFiltersComponent
 *
 * Reusable filter component for the mechanic management page.
 * It allows users to filter mechanics by search text and specialty.
 *
 * The component receives the current filter values from the parent component
 * and emits changes whenever the user updates the search field or specialty
 * selector.
 *
 * @component
 * @selector app-mechanic-filters
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
  selector: 'app-mechanic-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './mechanic-filters.html',
  styleUrl: './mechanic-filters.css'
})
export class MechanicFiltersComponent {

  /**
   * Current search text used to filter mechanics.
   */
  @Input() search = '';

  /**
   * Current selected specialty.
   * A null value means that all specialties are selected.
   */
  @Input() specialty: string | null = null;

  /**
   * List of available specialty options received from the parent component.
   */
  @Input() specialtyOptions: string[] = [];

  /**
   * Event emitted when the search text changes.
   */
  @Output() searchChange = new EventEmitter<string>();

  /**
   * Event emitted when the selected specialty changes.
   */
  @Output() specialtyChange = new EventEmitter<string | null>();

  /**
   * Emits the updated search text to the parent component.
   *
   * @param value New search text.
   */
  protected onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  /**
   * Emits the updated selected specialty to the parent component.
   *
   * @param value New selected specialty or null when all specialties are selected.
   */
  protected onSpecialtyChange(value: string | null): void {
    this.specialtyChange.emit(value);
  }
}