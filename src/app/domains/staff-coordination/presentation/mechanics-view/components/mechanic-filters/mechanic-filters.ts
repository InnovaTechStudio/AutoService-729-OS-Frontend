import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-mechanic-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './mechanic-filters.html',
  styleUrl: './mechanic-filters.css',
})
export class MechanicFiltersComponent {
  @Input() search = '';
  @Input() specialty: string | null = null;
  @Input() specialtyOptions: string[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() specialtyChange = new EventEmitter<string | null>();

  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  onSpecialtyChange(value: string | null): void {
    this.specialtyChange.emit(value);
  }
}
