/**
 * TaskCardComponent
 *
 * Reusable card component for displaying and managing an individual workshop task.
 * It shows the task image, work order code, description, assigned mechanic,
 * status, priority, estimated time and available task actions.
 *
 * The component allows users to:
 * - Change the task status.
 * - Edit the task.
 * - Delete the task.
 * - Navigate to the related work order.
 *
 * @component
 * @selector app-task-card
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

import { Task } from '../../../../domain/models/work-order.model';

/**
 * TaskCardView
 *
 * View model used by TaskCardComponent to display enriched task information.
 * It combines the original task domain model with additional presentation
 * data such as work order code, mechanic name, priority and estimated time.
 */
export interface TaskCardView {
  /**
   * Unique task identifier.
   */
  id: string;

  /**
   * Original task domain model.
   */
  raw: Task;

  /**
   * Task description displayed in the card.
   */
  description: string;

  /**
   * Work order identifier related to the task.
   */
  workOrderId: string;

  /**
   * Human-readable work order code.
   */
  workOrderCode: string;

  /**
   * Mechanic identifier assigned to the task.
   */
  mechanicId: string;

  /**
   * Mechanic name assigned to the task.
   */
  mechanicName: string;

  /**
   * Current task status.
   */
  status: Task['status'];

  /**
   * Task priority level.
   */
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';

  /**
   * Estimated task duration in hours.
   */
  estimatedTime: number;

  /**
   * Optional task evidence image URL.
   */
  photo?: string;
}

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css'
})
export class TaskCardComponent {

  /**
   * Task displayed by the card in an enriched view format.
   */
  @Input({ required: true }) task!: TaskCardView;

  /**
   * Available status options used by the status selector.
   */
  @Input() statusOptions: Task['status'][] = [];

  /**
   * Event emitted when the task status changes.
   */
  @Output() statusChange = new EventEmitter<{
    task: Task;
    status: Task['status'];
  }>();

  /**
   * Event emitted when the user requests to edit the task.
   */
  @Output() edit = new EventEmitter<Task>();

  /**
   * Event emitted when the user requests to delete the task.
   */
  @Output() delete = new EventEmitter<Task>();

  /**
   * Event emitted when the user requests to open the related work order.
   */
  @Output() goOrder = new EventEmitter<string>();

  /**
   * Emits a status change event with the selected status.
   *
   * @param status New selected task status.
   */
  protected onStatusChange(status: Task['status']): void {
    this.statusChange.emit({
      task: this.task.raw,
      status
    });
  }

  /**
   * Emits the selected task for editing.
   */
  protected onEdit(): void {
    this.edit.emit(this.task.raw);
  }

  /**
   * Emits the selected task for deletion.
   */
  protected onDelete(): void {
    this.delete.emit(this.task.raw);
  }

  /**
   * Emits the related work order ID.
   */
  protected onGoOrder(): void {
    this.goOrder.emit(this.task.workOrderId);
  }

  /**
   * Returns the CSS class based on the task status.
   *
   * @param status Current task status.
   * @returns CSS class for the status chip.
   */
  protected getStatusClass(status: Task['status']): string {
    if (status === 'Completada') return 'chip-success';
    if (status === 'En Proceso') return 'chip-info';

    return 'chip-warning';
  }

  /**
   * Returns the CSS class based on the task priority.
   *
   * @param priority Current task priority.
   * @returns CSS class for the priority label.
   */
  protected getPriorityClass(priority: string): string {
    if (priority === 'Crítica' || priority === 'Alta') return 'priority-high';
    if (priority === 'Media') return 'priority-medium';

    return 'priority-low';
  }

  /**
   * Returns the translation key for a task status.
   *
   * @param status Current task status.
   * @returns Translation key for the task status.
   */
  protected getStatusTranslationKey(status: Task['status']): string {
    if (status === 'Pendiente') return 'TASK_CARD.STATUS.PENDING';
    if (status === 'En Proceso') return 'TASK_CARD.STATUS.IN_PROGRESS';
    if (status === 'Completada') return 'TASK_CARD.STATUS.COMPLETED';

    return 'TASK_CARD.STATUS.UNKNOWN';
  }

  /**
   * Returns the translation key for a task priority.
   *
   * @param priority Current task priority.
   * @returns Translation key for the priority label.
   */
  protected getPriorityTranslationKey(priority: string): string {
    if (priority === 'Baja') return 'TASK_CARD.PRIORITY.LOW';
    if (priority === 'Media') return 'TASK_CARD.PRIORITY.MEDIUM';
    if (priority === 'Alta') return 'TASK_CARD.PRIORITY.HIGH';
    if (priority === 'Crítica') return 'TASK_CARD.PRIORITY.CRITICAL';

    return 'TASK_CARD.PRIORITY.UNKNOWN';
  }
}