/**
 * TrackingViewComponent
 *
 * Component that allows customers to search and view the current status
 * of a work order using its tracking code.
 * Displays information about the vehicle, the order, current tasks,
 * mechanic explanations and the technical history of the vehicle.
 *
 * @component
 * @selector app-tracking-view
 * @standalone true
 */

import { Component, inject, effect, computed } from '@angular/core';
import { Router } from '@angular/router';
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

import { VehicleHistoryStore } from '../../../vehicle-history/application/vehicle-history.store';

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
  vehicleHistoryStore = inject(VehicleHistoryStore);
  dialog = inject(MatDialog);
  private readonly router = inject(Router);

  /** Tracking code entered by the customer */
  trackingCode = '';

  /** Selected task used to display evidence and mechanic explanation */
  selectedTask: Task | null = null;

  currentDate: string = new Date().toLocaleDateString();

  /** Prevents unnecessary repeated history requests for the same plate */
  private loadedHistoryPlate = '';

  /**
   * Customer-facing tasks.
   */
  readonly customerVisibleTasks = computed(() =>
    this.trackingStore.tasks().filter(
      (task) =>
        task.status === 'Completada' ||
        task.customerReportStatus === 'Visible para Cliente'
    )
  );

  constructor() {
    effect(() => {
      const tasks = this.trackingStore.tasks();

      if (tasks && tasks.length > 0) {
        const taskWithCustomerExplanation = tasks.find(
          (task) =>
            task.customerExplanation &&
            task.customerExplanation.trim().length > 0
        );

        const taskWithPhoto = tasks.find((task) => task.photo);

        this.selectedTask =
          taskWithCustomerExplanation || taskWithPhoto || tasks[0];
      } else {
        this.selectedTask = null;
      }
    });

    /**
     * Loads vehicle history by plate
     */
    effect(() => {
      const vehicle = this.trackingStore.vehicle();
      const plate = vehicle?.plate?.trim();

      if (!plate || plate === this.loadedHistoryPlate) {
        return;
      }

      this.loadedHistoryPlate = plate;
      this.vehicleHistoryStore.loadByPlate(plate);
    });
  }

  /**
   * Search work order
   */
  handleSearch(): void {
    if (!this.trackingCode.trim()) return;

    this.loadedHistoryPlate = '';
    this.vehicleHistoryStore.history.set([]);
    this.trackingStore.searchOrder(this.trackingCode.trim());
  }

  /**
   * Select task
   */
  selectTask(task: Task): void {
    this.selectedTask = task;
  }

  /**
   * Open payment modal
   */
  openPaymentModal(): void {
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
   * Order status severity
   */
  getStatusSeverity(status: string): string {
    if (status === 'Finalizado') return 'success';
    if (status === 'En Proceso') return 'info';
    return 'warning';
  }

  /**
   * Task severity tag
   */
  getTaskTagSeverity(status: string): string {
    if (status === 'Completada') return 'success';
    if (status === 'En Proceso') return 'info';
    return 'secondary';
  }

  /**
   * Customer explanation fallback
   */
  getSelectedTaskCustomerExplanation(): string {
    if (!this.selectedTask?.customerExplanation) {
      return 'El taller todavía no ha publicado una explicación detallada para esta tarea.';
    }

    return this.selectedTask.customerExplanation;
  }

  /**
   * Evidence check
   */
  hasSelectedTaskEvidence(): boolean {
    return !!this.selectedTask?.photo || !!this.selectedTask?.evidenceRegistered;
  }

  /**
   * Navigate to full history view (feature)
   */
  goToFullHistory(): void {
    const plate = this.trackingStore.vehicle()?.plate;

    if (plate) {
      this.router.navigate(['/tracking/history', plate]);
    }
  }
  downloadPDF(): void {
    window.print();
  }
}
