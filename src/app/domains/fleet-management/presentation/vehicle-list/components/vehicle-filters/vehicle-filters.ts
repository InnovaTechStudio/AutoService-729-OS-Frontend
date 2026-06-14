import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicle-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './vehicle-filters.html',
  styleUrl: './vehicle-filters.css',
})
export class VehicleFiltersComponent {
  @Input() search: string = '';
  @Input() status: string | null = null;
  @Input() sortBy: string | null = null;
  @Input() statusOptions: any[] = [];
  @Input() sortOptions: any[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string | null>();
  @Output() sortByChange = new EventEmitter<string | null>();

  constructor(public translate: TranslateService) {}

  onSearchChange(value: string) {
    this.searchChange.emit(value);
  }

  onStatusChange(value: string | null) {
    this.statusChange.emit(value);
  }

  onSortByChange(value: string | null) {
    this.sortByChange.emit(value);
  }
}
