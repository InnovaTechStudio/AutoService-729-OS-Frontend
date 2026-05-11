import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { WorkOrder } from '../../../../domain/models/work-order.model';

@Component({
  selector: 'app-work-order-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './work-order-filters.html',
  styleUrl: './work-order-filters.css'
})
export class WorkOrderFiltersComponent {
  @Input() search = '';
  @Input() status: WorkOrder['status'] | null = null;
  @Input() statusOptions: WorkOrder['status'][] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<WorkOrder['status'] | null>();

  protected onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  protected onStatusChange(value: WorkOrder['status'] | null): void {
    this.statusChange.emit(value);
  }
}
