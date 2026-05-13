/**
 * TaskFiltersComponent
 *
 * Reusable filter component for the task management view.
 * It allows users to filter tasks by search text, task status
 * and assigned mechanic.
 *
 * The component receives the current filter values and available
 * options from the parent component, then emits changes whenever
 * the user updates any filter.
 *
 * @component
 * @selector app-task-filters
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

import { Mechanic } from '../../../../../staff-coordination/domain/models/mechanic.model';
import { Task } from '../../../../domain/models/work-order.model';

@Component({
  selector: 'app-task-filters',
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
  templateUrl: './task-filters.html',
  styleUrl: './task-filters.css'
})
export class TaskFiltersComponent {

  /**
   * Current search term used to filter tasks by description,
   * work order code or mechanic name.
   */
  @Input() search = '';

  /**
   * Currently selected task status.
   * A null value means that all statuses are selected.
   */
  @Input() status: Task['status'] | null = null;

  /**
   * Currently selected mechanic ID.
   * A null value means that all mechanics are selected.
   */
  @Input() mechanicId: string | null = null;

  /**
   * Available task status options received from the parent component.
   */
  @Input() statusOptions: Task['status'][] = [];

  /**
   * Available mechanic options received from the parent component.
   */
  @Input() mechanicOptions: Mechanic[] = [];

  /**
   * Event emitted when the search term changes.
   */
  @Output() searchChange = new EventEmitter<string>();

  /**
   * Event emitted when the selected status changes.
   */
  @Output() statusChange = new EventEmitter<Task['status'] | null>();

  /**
   * Event emitted when the selected mechanic changes.
   */
  @Output() mechanicIdChange = new EventEmitter<string | null>();

  /**
   * Emits the updated search term to the parent component.
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
  protected onStatusChange(value: Task['status'] | null): void {
    this.statusChange.emit(value);
  }

  /**
   * Emits the updated selected mechanic ID to the parent component.
   *
   * @param value New selected mechanic ID or null when all mechanics are selected.
   */
  protected onMechanicChange(value: string | null): void {
    this.mechanicIdChange.emit(value);
  }

  /**
   * Returns the translation key for a task status.
   *
   * @param status Task status value.
   * @returns Translation key for the status label.
   */
  protected getStatusTranslationKey(status: Task['status']): string {
    if (status === 'Pendiente') return 'TASK_FILTERS.STATUS_OPTIONS.PENDING';
    if (status === 'En Proceso') return 'TASK_FILTERS.STATUS_OPTIONS.IN_PROGRESS';
    if (status === 'Completada') return 'TASK_FILTERS.STATUS_OPTIONS.COMPLETED';

    return 'TASK_FILTERS.STATUS_OPTIONS.UNKNOWN';
  }
}