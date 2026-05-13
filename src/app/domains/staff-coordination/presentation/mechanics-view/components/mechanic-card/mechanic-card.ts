import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TranslateModule } from '@ngx-translate/core';

import { Mechanic } from '../../../../domain/models/mechanic.model';

/**
 * MechanicCardView
 *
 * View model used by MechanicCardComponent to render mechanic information
 * in the user interface.
 *
 * It combines the original Mechanic domain model with additional display
 * properties such as workload metrics, status labels, CSS classes and
 * effectiveness values.
 *
 * @interface
 */
export interface MechanicCardView {
  /**
   * Unique identifier of the mechanic.
   */
  id: string;

  /**
   * Original mechanic domain model associated with this card.
   */
  raw: Mechanic;

  /**
   * Mechanic full name displayed in the UI.
   */
  fullName: string;

  /**
   * Mechanic assigned specialty.
   */
  specialty: string;

  /**
   * Maximum number of tasks the mechanic can manage.
   */
  maxCapacity: number;

  /**
   * Number of tasks currently assigned to the mechanic.
   */
  activeTasks: number;

  /**
   * Current workload percentage calculated for the mechanic.
   */
  loadPercentage: number;

  /**
   * Human-readable workload status displayed in the card.
   */
  workloadStatus: string;

  /**
   * CSS class used to style the workload indicator.
   */
  loadClass: string;

  /**
   * Effectiveness value associated with the mechanic.
   */
  effectiveness: number;
}

/**
 * MechanicCardComponent
 *
 * Reusable card component responsible for displaying a mechanic summary.
 * It shows the mechanic profile, specialty, active tasks, effectiveness,
 * workload percentage and action buttons for editing or deleting the mechanic.
 *
 * @component
 * @selector app-mechanic-card
 * @standalone true
 */
@Component({
  selector: 'app-mechanic-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslateModule
  ],
  templateUrl: './mechanic-card.html',
  styleUrl: './mechanic-card.css'
})
export class MechanicCardComponent {

  /**
   * Mechanic data used to render the card.
   */
  @Input({ required: true }) mechanic!: MechanicCardView;

  /**
   * Event emitted when the user requests to edit the mechanic.
   */
  @Output() edit = new EventEmitter<Mechanic>();

  /**
   * Event emitted when the user requests to delete the mechanic.
   */
  @Output() delete = new EventEmitter<Mechanic>();

  /**
   * Emits the original mechanic domain model for editing.
   */
  protected onEdit(): void {
    this.edit.emit(this.mechanic.raw);
  }

  /**
   * Emits the original mechanic domain model for deletion.
   */
  protected onDelete(): void {
    this.delete.emit(this.mechanic.raw);
  }

  /**
   * Returns the CSS class that represents the current workload level.
   *
   * @returns CSS class corresponding to the mechanic workload percentage.
   */
  protected getWorkloadClass(): string {
    if (this.mechanic.loadPercentage >= 100) return 'status-danger';
    if (this.mechanic.loadPercentage >= 70) return 'status-warning';

    return 'status-success';
  }

  /**
   * Returns the translation key for the mechanic workload status.
   *
   * @returns Translation key for the workload status label.
   */
  protected getWorkloadStatusTranslationKey(): string {
    const status = this.mechanic.workloadStatus;

    if (status === 'Disponible' || status === 'Available') {
      return 'MECHANIC_CARD.WORKLOAD_STATUS.AVAILABLE';
    }

    if (status === 'Ocupado' || status === 'Busy') {
      return 'MECHANIC_CARD.WORKLOAD_STATUS.BUSY';
    }

    if (status === 'Sobrecargado' || status === 'Overloaded') {
      return 'MECHANIC_CARD.WORKLOAD_STATUS.OVERLOADED';
    }

    return 'MECHANIC_CARD.WORKLOAD_STATUS.UNKNOWN';
  }
}