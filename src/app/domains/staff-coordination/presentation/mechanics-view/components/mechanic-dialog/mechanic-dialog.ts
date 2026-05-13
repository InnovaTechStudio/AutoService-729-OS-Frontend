import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

import { Mechanic } from '../../../../domain/models/mechanic.model';

/**
 * MechanicDialogComponent
 *
 * Standalone dialog component used to create or edit workshop mechanic data.
 * It displays a form with mechanic information such as full name, specialty,
 * phone number, maximum task capacity and initial status.
 *
 * The component works as a presentational form. It receives the mechanic model
 * and specialty options from the parent component, then emits events when the
 * user saves or cancels the operation.
 *
 * @component
 * @selector app-mechanic-dialog
 * @standalone true
 */
@Component({
  selector: 'app-mechanic-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './mechanic-dialog.html',
  styleUrl: './mechanic-dialog.css'
})
export class MechanicDialogComponent {

  /**
   * Mechanic domain model used by the dialog form.
   * It contains the data to be created or edited.
   */
  @Input({ required: true }) mechanic!: Mechanic;

  /**
   * List of available mechanic specialties displayed in the specialty selector.
   */
  @Input() specialtyOptions: string[] = [];

  /**
   * Event emitted when the user confirms the save action.
   */
  @Output() save = new EventEmitter<void>();

  /**
   * Event emitted when the user cancels or closes the dialog.
   */
  @Output() cancel = new EventEmitter<void>();

  /**
   * Emits the save event to notify the parent component.
   */
  protected onSave(): void {
    this.save.emit();
  }

  /**
   * Emits the cancel event to notify the parent component.
   */
  protected onCancel(): void {
    this.cancel.emit();
  }
}