/**
 * TrackingViewComponent
 *
 * Component that allows users to search and view the current status
 * of a work order using its tracking code.
 * Displays information about the vehicle, the order, and the progress of the tasks.
 *
 * @component
 * @selector app-tracking-view
 * @standalone true
 */

import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TrackingStore } from '../../application/tracking.store';
import { Task } from '../../../workshop-operations/domain/models/work-order.model';
import { PaymentModalComponent } from '../payment-modal/payment-modal';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/language-switcher/language-switcher';

@Component({
  selector: 'app-tracking-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './tracking-view.html',
  styleUrl: './tracking-view.css',
})
export class TrackingViewComponent {
  trackingStore = inject(TrackingStore);
  dialog = inject(MatDialog);

  /** Tracking code entered by the user */
  trackingCode = '';

  selectedTask: Task | null = null;

  constructor() {
    effect(() => {
      const tasks = this.trackingStore.tasks();

      if (tasks && tasks.length > 0) {
        // Select the first task that has a photo, or just the first task
        const taskWithPhoto = tasks.find((t) => t.photo);

        this.selectedTask = taskWithPhoto || tasks[0];
      } else {
        this.selectedTask = null;
      }
    });
  }

  /**
   * Performs the search for a work order using the entered code.
   */
  handleSearch() {
    if (this.trackingCode) {
      this.trackingStore.searchOrder(this.trackingCode);
    }
  }

  /**
   * Selects a task from the list.
   *
   * @param task Selected task
   */
  selectTask(task: Task) {
    this.selectedTask = task;
  }

  /**
   * Opens the payment modal for the current order.
   */
  openPaymentModal() {
    const order = this.trackingStore.order();

    if (order && order.price) {
      const dialogRef = this.dialog.open(PaymentModalComponent, {
        width: '500px',
        panelClass: 'payment-dialog-container',
        data: { amount: order.price },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('Pago completado con éxito');
        }
      });
    }
  }

  /**
   * Returns the severity level for the order status.
   *
   * @param status Order status
   * @returns Severity string
   */
  getStatusSeverity(status: string): string {
    if (status === 'Finalizado') return 'success';
    if (status === 'En Proceso') return 'info';

    return 'warning';
  }

  /**
   * Returns the icon corresponding to the status of a task.
   *
   * @param status Status of the task
   * @returns Material icon name
   */
  getTaskIcon(status: string): string {
    if (status === 'Completada') return 'pi pi-check';
    if (status === 'En Proceso') return 'pi pi-cog pi-spin';

    return 'pi pi-circle-fill';
  }

  /**
   * Returns the severity tag for a task.
   *
   * @param status Task status
   * @returns Severity string
   */
  getTaskTagSeverity(status: string): string {
    if (status === 'Completada') return 'success';
    if (status === 'En Proceso') return 'info';

    return 'secondary';
  }
}
