import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Mechanic } from '../../../../domain/models/mechanic.model';

@Component({
  selector: 'app-mechanic-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  templateUrl: './mechanic-card.html',
  styleUrl: './mechanic-card.css',
})
export class MechanicCardComponent {
  @Input({ required: true }) mechanic!: Mechanic;
  @Output() edit = new EventEmitter<Mechanic>();
  @Output() delete = new EventEmitter<Mechanic>();

  private translate = inject(TranslateService);

  get initials(): string {
    if (!this.mechanic.fullName) return 'M';
    const names = this.mechanic.fullName.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return names[0].substring(0, 2).toUpperCase();
  }

  get loadPercentage(): number {
    if (!this.mechanic.maxCapacity) return 0;
    const percentage = ((this.mechanic.currentLoad || 0) / this.mechanic.maxCapacity) * 100;
    return Math.min(Math.round(percentage), 100);
  }

  get statusClass(): string {
    if (this.loadPercentage >= 100) return 'status-danger';
    if (this.loadPercentage >= 75) return 'status-warning';
    return 'status-safe';
  }

  get capacityStatus() {
    if (this.loadPercentage >= 100) {
      return { label: this.translate.instant('mechanic.capacity.full'), class: 'badge-danger' };
    }
    if (this.loadPercentage >= 75) {
      return { label: this.translate.instant('mechanic.capacity.high'), class: 'badge-warning' };
    }
    return { label: this.translate.instant('mechanic.capacity.available'), class: 'badge-success' };
  }
}
