import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
    MatIconModule
  ],
  templateUrl: './task-filters.html',
  styleUrl: './task-filters.css'
})
export class TaskFiltersComponent {
  @Input() search = '';
  @Input() status: Task['status'] | null = null;
  @Input() mechanicId: string | null = null;
  @Input() statusOptions: Task['status'][] = [];
  @Input() mechanicOptions: Mechanic[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<Task['status'] | null>();
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
