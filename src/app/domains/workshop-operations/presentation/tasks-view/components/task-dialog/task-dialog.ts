/**
 * TaskDialogComponent
 *
 * Reusable dialog component for creating or editing a workshop task.
 * It can be used inside a Material Dialog or as an inline modal.
 *
 * The component receives the task data and selection options such as
 * work orders, mechanics, statuses and priorities. It also allows the
 * user to upload a visual evidence image for the task.
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

import { TranslateModule } from '@ngx-translate/core';

import { Mechanic } from '../../../../../staff-coordination/domain/models/mechanic.model';
import { Task, WorkOrder } from '../../../../domain/models/work-order.model';

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
    TranslateModule
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.css'
})
export class TaskDialogComponent {

  /**
   * Task model used to create or edit task information.
   */
  @Input({ required: true }) task!: Task;

  /**
   * List of available work orders for task assignment.
   */
  @Input() workOrderOptions: WorkOrder[] = [];

  /**
   * List of available mechanics for task assignment.
   */
  @Input() mechanicOptions: Mechanic[] = [];

  /**
   * Available task status options.
   */
  @Input() statusOptions: Task['status'][] = [];

  /**
   * Available task priority options.
   */
  @Input() priorityOptions: Array<'Baja' | 'Media' | 'Alta' | 'Crítica'> = [];

  /**
   * Event emitted when the user saves the task.
   */
  @Output() save = new EventEmitter<void>();

  /**
   * Event emitted when the user cancels or closes the dialog.
   */
  @Output() cancel = new EventEmitter<void>();

  /**
   * Emits the save event to notify the parent component.
   */
  protected onSave(): void {
    this.save.emit();
  }

  /**
   * Emits the cancel event to notify the parent component.
   */
  protected onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Handles the selected image file and stores it as a Base64 string
   * in the task photo property.
   *
   * @param event File input change event.
   */
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

  /**
   * Returns the translation key for a task status.
   *
   * @param status Task status value.
   * @returns Translation key for the status label.
   */
  protected getStatusTranslationKey(status: Task['status']): string {
    if (status === 'Pendiente') return 'TASK_DIALOG.STATUS_OPTIONS.PENDING';
    if (status === 'En Proceso') return 'TASK_DIALOG.STATUS_OPTIONS.IN_PROGRESS';
    if (status === 'Completada') return 'TASK_DIALOG.STATUS_OPTIONS.COMPLETED';

    return 'TASK_DIALOG.STATUS_OPTIONS.UNKNOWN';
  }

  /**
   * Returns the translation key for a task priority.
   *
   * @param priority Task priority value.
   * @returns Translation key for the priority label.
   */
  protected getPriorityTranslationKey(priority: string): string {
    if (priority === 'Baja') return 'TASK_DIALOG.PRIORITY_OPTIONS.LOW';
    if (priority === 'Media') return 'TASK_DIALOG.PRIORITY_OPTIONS.MEDIUM';
    if (priority === 'Alta') return 'TASK_DIALOG.PRIORITY_OPTIONS.HIGH';
    if (priority === 'Crítica') return 'TASK_DIALOG.PRIORITY_OPTIONS.CRITICAL';

    return 'TASK_DIALOG.PRIORITY_OPTIONS.UNKNOWN';
  }
}