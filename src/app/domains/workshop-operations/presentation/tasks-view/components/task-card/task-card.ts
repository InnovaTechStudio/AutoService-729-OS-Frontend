/**
 * TaskCardComponent
 * 
 * Reusable card component for displaying and managing an individual task.
 * Allows changing the status, editing, and deleting the task directly from the view.
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

import { Task } from '../../../../domain/models/work-order.model';

export interface TaskCardView {
  id: string;
  raw: Task;
  description: string;
  workOrderId: string;
  workOrderCode: string;
  mechanicId: string;
  mechanicName: string;
  status: Task['status'];
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  estimatedTime: number;
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
    MatSelectModule
  ],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css'
})
export class TaskCardComponent { 
  /** Task to display in an enriched format */
  @Input({ required: true }) task!: TaskCardView;

  /** Available options for changing the status */
  @Input() statusOptions: Task['status'][] = [];

  /** Emits when the task status is changed */
  @Output() statusChange = new EventEmitter<{
    task: Task;
    status: Task['status'];
  }>();

  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  @Output() goOrder = new EventEmitter<string>();

  /**
   * Emits an event when the user changes the status of the task.
   */
  protected onStatusChange(status: Task['status']): void {
    this.statusChange.emit({
      task: this.task.raw,
      status
    });
  }

  protected onEdit(): void {
    this.edit.emit(this.task.raw);
  }

  protected onDelete(): void {
    this.delete.emit(this.task.raw);
  }

  protected onGoOrder(): void {
    this.goOrder.emit(this.task.workOrderId);
  }

  /**
   * Returns the CSS class based on the task status.
   */
  protected getStatusClass(status: Task['status']): string {
    if (status === 'Completada') return 'chip-success';
    if (status === 'En Proceso') return 'chip-info';
    return 'chip-warning';
  }

  /**
   * Returns the CSS class based on the task priority.
   */
  protected getPriorityClass(priority: string): string {
    if (priority === 'Crítica' || priority === 'Alta') return 'priority-high';
    if (priority === 'Media') return 'priority-medium';
    return 'priority-low';
  }
}
