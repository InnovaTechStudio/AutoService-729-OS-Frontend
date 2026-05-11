import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-mechanic-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './mechanic-filters.html',
  styleUrl: './mechanic-filters.css'
})
export class MechanicFiltersComponent {
  @Input() search = '';
  @Input() specialty: string | null = null;
  @Input() specialtyOptions: string[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() specialtyChange = new EventEmitter<string | null>();

  protected onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  protected onSpecialtyChange(value: string | null): void {
    this.specialtyChange.emit(value);
  }
}
