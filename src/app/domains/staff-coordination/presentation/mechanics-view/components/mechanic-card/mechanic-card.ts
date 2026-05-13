import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Mechanic } from '../../../../domain/models/mechanic.model';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * MechanicCardView
 *
 * View model used by MechanicCardComponent to render mechanic information
 * in the user interface.
 *
 * It combines the original Mechanic domain model with additional display
 * properties such as workload metrics, status labels, CSS classes, and
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
   * Mechanic's full name displayed in the UI.
   */
  fullName: string;

  /**
   * Mechanic's assigned specialty.
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
 * Displays a mechanic card with workload and action controls.
 *
 * @remarks
 * This standalone Angular component receives a mechanic view model and emits
 * events when the user requests to edit or delete the related mechanic.
 */
@Component({
  selector: 'app-mechanic-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslatePipe
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
   * Emits the mechanic selected for editing.
   */
  @Output() edit = new EventEmitter<Mechanic>();

  /**
   * Emits the mechanic selected for deletion.
   */
  @Output() delete = new EventEmitter<Mechanic>();

  /**
   * Handles the edit action for the current mechanic.
   *
   * @remarks
   * Emits the original mechanic domain model through the `edit` output.
   */
  protected onEdit(): void {
    this.edit.emit(this.mechanic.raw);
  }

  /**
   * Handles the delete action for the current mechanic.
   *
   * @remarks
   * Emits the original mechanic domain model through the `delete` output.
   */
  protected onDelete(): void {
    this.delete.emit(this.mechanic.raw);
  }

  /**
   * Gets the CSS class that represents the current workload level.
   *
   * @returns The CSS class corresponding to the mechanic's workload percentage.
   */
  protected getWorkloadClass(): string {
    if (this.mechanic.loadPercentage >= 100) return 'status-danger';
    if (this.mechanic.loadPercentage >= 70) return 'status-warning';
    return 'status-success';
  }
}
