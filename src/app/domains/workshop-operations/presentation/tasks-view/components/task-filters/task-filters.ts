/**
 * TaskFiltersComponent
 *
 * Component for filtering the tasks view.
 * Allows filtering by:
 * - Textual search (description, work order code, mechanic)
 * - Task status
 * - Assigned mechanic
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

import { Mechanic } from '../../../../../staff-coordination/domain/models/mechanic.model';
import { Task } from '../../../../domain/models/work-order.model';
import { TranslatePipe } from '@ngx-translate/core';

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
    TranslatePipe,
  ],
  templateUrl: './task-filters.html',
  styleUrl: './task-filters.css',
})
export class TaskFiltersComponent {
  /** Current search term */
  @Input() search = '';

  /** Selected status */
  @Input() status: Task['status'] | null = null;

  /** ID of the selected mechanic */
  @Input() mechanicId: string | null = null;

  /** Available status options */
  @Input() statusOptions: Task['status'][] = [];

  /** Available mechanic options */
  @Input() mechanicOptions: Mechanic[] = [];

  /** Emits when the search term changes */
  @Output() searchChange = new EventEmitter<string>();

  /** Emits when the selected status changes */
  @Output() statusChange = new EventEmitter<Task['status'] | null>();

  /** Emits when the selected mechanic changes */
  @Output() mechanicIdChange = new EventEmitter<string | null>();

  protected onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  protected onStatusChange(value: Task['status'] | null): void {
    this.statusChange.emit(value);
  }

  protected onMechanicChange(value: string | null): void {
    this.mechanicIdChange.emit(value);
  }
}
