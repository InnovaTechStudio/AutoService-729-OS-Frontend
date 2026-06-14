import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, TranslatePipe],
  templateUrl: './vehicle-card.html',
  styleUrl: './vehicle-card.css',
})
export class VehicleCardComponent {
  @Input({ required: true }) vehicle!: any;
  @Output() edit = new EventEmitter<any>();
  @Output() viewDetail = new EventEmitter<any>();

  getSeverityClass(severity: string): string {
    return `badge-${severity}`;
  }
}
