import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Mechanic } from '../../../../domain/models/mechanic.model';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * MechanicDialogComponent
 *
 * Standalone component that displays a dialog form for creating or editing
 * workshop mechanic information.
 *
 * It receives a Mechanic domain model as input and provides a list of available
 * specialty options for the form. The component emits events when the user
 * confirms the save action or cancels the dialog.
 *
 * This component is mainly used as a presentation layer for mechanic form data,
 * delegating the save and cancel handling to the parent component.
 *
 * @component
 * @standalone
 * @selector app-mechanic-dialog
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
    TranslatePipe,
  ],
  templateUrl: './mechanic-dialog.html',
  styleUrl: './mechanic-dialog.css',
})
export class MechanicDialogComponent {
  /**
   * Mechanic
   *
   * Mechanic domain model used by the dialog form.
   *
   * This input contains the mechanic information that will be displayed,
   * created, or edited through the dialog fields.
   *
   * @input
   * @required
   */
  @Input({ required: true }) mechanic!: Mechanic;
  @Input() specialtyOptions: string[] = [];

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  protected onSave(): void {
    this.save.emit();
  }

  protected onCancel(): void {
    this.cancel.emit();
  }
}
