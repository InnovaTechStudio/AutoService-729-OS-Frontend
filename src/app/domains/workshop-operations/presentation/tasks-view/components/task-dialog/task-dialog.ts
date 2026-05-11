import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
    MatSelectModule
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.css'
})
export class TaskDialogComponent {
  @Input({ required: true }) task!: Task;
  @Input() workOrderOptions: WorkOrder[] = [];
  @Input() mechanicOptions: Mechanic[] = [];
  @Input() statusOptions: Task['status'][] = [];
  @Input() priorityOptions: Array<'Baja' | 'Media' | 'Alta' | 'Crítica'> = [];

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  protected onSave(): void {
    this.save.emit();
  }

  protected onCancel(): void {
    this.cancel.emit();
  }
}
