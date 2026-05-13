/**
 * TaskDialogComponent
 *
 * Reusable dialog component for creating or editing a task.
 * It is used within a MatDialog or as an inline modal.
 *
 * It receives the task data and selection options (work orders,
 * mechanics, statuses, and priorities).
 *
 * @component
 * @selector app-task-dialog
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Mechanic } from '../../../../../staff-coordination/domain/models/mechanic.model';
import { Task, WorkOrder } from '../../../../domain/models/work-order.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.css',
})
export class TaskDialogComponent {
  /** Task to create or edit */
  @Input({ required: true }) task!: Task;

  /** List of available work orders for assignment */
  @Input() workOrderOptions: WorkOrder[] = [];

  /** List of available mechanics for assignment */
  @Input() mechanicOptions: Mechanic[] = [];

  /** Available status options */
  @Input() statusOptions: Task['status'][] = [];

  /** Available priority options */
  @Input() priorityOptions: Array<'Baja' | 'Media' | 'Alta' | 'Crítica'> = [];

  /** Event emitted when saving changes */
  @Output() save = new EventEmitter<void>();

  /** Event emitted when canceling */
  @Output() cancel = new EventEmitter<void>();

  /** Emits the save event */
  protected onSave(): void {
    this.save.emit();
  }

  /** Emits the cancel event */
  protected onCancel(): void {
    this.cancel.emit();
  }
  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.task.photo = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
