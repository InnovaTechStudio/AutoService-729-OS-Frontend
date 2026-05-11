import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Mechanic } from '../../../../domain/models/mechanic.model';

export interface MechanicCardView {
  id: string;
  raw: Mechanic;
  fullName: string;
  specialty: string;
  maxCapacity: number;
  activeTasks: number;
  loadPercentage: number;
  workloadStatus: string;
  loadClass: string;
  effectiveness: number;
}

@Component({
  selector: 'app-mechanic-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './mechanic-card.html',
  styleUrl: './mechanic-card.css'
})
export class MechanicCardComponent {
  @Input({ required: true }) mechanic!: MechanicCardView;

  @Output() edit = new EventEmitter<Mechanic>();
  @Output() delete = new EventEmitter<Mechanic>();

  protected onEdit(): void {
    this.edit.emit(this.mechanic.raw);
  }

  protected onDelete(): void {
    this.delete.emit(this.mechanic.raw);
  }

  protected getWorkloadClass(): string {
    if (this.mechanic.loadPercentage >= 100) return 'status-danger';
    if (this.mechanic.loadPercentage >= 70) return 'status-warning';
    return 'status-success';
  }
}
