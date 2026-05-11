import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-vehicle-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './vehicle-filters.html',
  styleUrl: './vehicle-filters.css'
})
export class VehicleFiltersComponent {
  @Input() search = '';
  @Input() status: string | null = null;
  @Input() statusOptions: string[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string | null>();

  protected onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  protected onStatusChange(value: string | null): void {
    this.statusChange.emit(value);
  }
}
