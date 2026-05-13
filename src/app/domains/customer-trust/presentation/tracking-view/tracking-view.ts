/**
 * TrackingViewComponent
 *
 * Component that allows users to search and view the current status
 * of a work order using its tracking code. It displays information
 * about the vehicle, the service order, the estimated cost, the service
 * dates and the progress of each task.
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

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TrackingStore } from '../../application/tracking.store';
import { Task } from '../../../workshop-operations/domain/models/work-order.model';
import { PaymentModalComponent } from '../payment-modal/payment-modal';

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
    TranslateModule
  ],
  templateUrl: './tracking-view.html',
  styleUrl: './tracking-view.css'
})
export class TrackingViewComponent {

  /**
   * Store used to manage tracking data, including the order,
   * vehicle, tasks, loading state and errors.
   */
  trackingStore = inject(TrackingStore);

  /**
   * Angular Material dialog service used to open the payment modal.
   */
  dialog = inject(MatDialog);

  /**
   * Translation service used for messages generated from TypeScript.
   */
  private translate = inject(TranslateService);

  /**
   * Tracking code entered by the user.
   */
  trackingCode = '';

  /**
   * Currently selected task used to display visual evidence.
   */
  selectedTask: Task | null = null;

  /**
   * Creates the tracking view component and automatically selects
   * the first task with visual evidence when the task list changes.
   */
  constructor() {
    effect(() => {
      const tasks = this.trackingStore.tasks();

      if (tasks && tasks.length > 0) {
        const taskWithPhoto = tasks.find(task => task.photo);
        this.selectedTask = taskWithPhoto || tasks[0];
      } else {
        this.selectedTask = null;
      }
    });
  }

  /**
   * Searches for a work order using the tracking code entered by the user.
   */
  handleSearch(): void {
    if (this.trackingCode.trim()) {
      this.trackingStore.searchOrder(this.trackingCode.trim());
    }
  }

  /**
   * Selects a task from the service task list.
   *
   * @param task Selected task.
   */
  selectTask(task: Task): void {
    this.selectedTask = task;
  }

  /**
   * Opens the payment modal for the current order when the order has a price.
   */
  openPaymentModal(): void {
    const order = this.trackingStore.order();

    if (order && order.price) {
      const dialogRef = this.dialog.open(PaymentModalComponent, {
        width: '500px',
        panelClass: 'payment-dialog-container',
        data: { amount: order.price }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(this.translate.instant('TRACKING.PAYMENT_SUCCESS_LOG'));
        }
      });
    }
  }

  /**
   * Returns the severity level used by the order status tag.
   *
   * @param status Current order status.
   * @returns CSS severity value.
   */
  getStatusSeverity(status: string): string {
    if (status === 'Finalizado') return 'success';
    if (status === 'En Proceso') return 'info';

    return 'warning';
  }

  /**
   * Returns the Angular Material icon name according to the task status.
   *
   * @param status Current task status.
   * @returns Material icon name.
   */
  getTaskIcon(status: string): string {
    if (status === 'Completada') return 'check_circle';
    if (status === 'En Proceso') return 'settings';
    if (status === 'Pendiente') return 'schedule';

    return 'circle';
  }

  /**
   * Returns the severity level used by the task status tag.
   *
   * @param status Current task status.
   * @returns CSS severity value.
   */
  getTaskTagSeverity(status: string): string {
    if (status === 'Completada') return 'success';
    if (status === 'En Proceso') return 'info';

    return 'secondary';
  }

  /**
   * Returns the translation key for an order or task status.
   *
   * @param status Status received from the store or backend.
   * @returns Translation key for the given status.
   */
  getStatusTranslationKey(status: string | undefined): string {
    switch (status) {
      case 'Finalizado':
        return 'TRACKING.STATUS.FINISHED';

      case 'En Proceso':
        return 'TRACKING.STATUS.IN_PROGRESS';

      case 'Completada':
        return 'TRACKING.STATUS.COMPLETED';

      case 'Pendiente':
        return 'TRACKING.STATUS.PENDING';

      default:
        return 'TRACKING.STATUS.UNKNOWN';
    }
  }
}