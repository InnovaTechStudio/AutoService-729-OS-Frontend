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

@Component({
  selector: 'app-tracking-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './tracking-view.html',
  styleUrl: './tracking-view.css'
})
export class TrackingViewComponent {
  trackingStore = inject(TrackingStore);
  dialog = inject(MatDialog);
  trackingCode = '';
  selectedTask: Task | null = null;

  constructor() {
    effect(() => {
      const tasks = this.trackingStore.tasks();
      if (tasks && tasks.length > 0) {
        // Select the first task that has a photo, or just the first task
        const taskWithPhoto = tasks.find(t => t.photo);
        this.selectedTask = taskWithPhoto || tasks[0];
      } else {
        this.selectedTask = null;
      }
    });
  }

  handleSearch() {
    if (this.trackingCode) {
      this.trackingStore.searchOrder(this.trackingCode);
    }
  }

  selectTask(task: Task) {
    this.selectedTask = task;
  }

  openPaymentModal() {
    const order = this.trackingStore.order();
    if (order && order.price) {
      const dialogRef = this.dialog.open(PaymentModalComponent, {
        width: '500px',
        panelClass: 'payment-dialog-container',
        data: { amount: order.price }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Si el pago fue exitoso, se puede mostrar un snackbar o recargar datos
          console.log('Pago completado con éxito');
        }
      });
    }
  }

  getStatusSeverity(status: string): string {
    if (status === 'Finalizado') return 'success';
    if (status === 'En Proceso') return 'info';
    return 'warning';
  }

  getTaskIcon(status: string): string {
    if (status === 'Completada') return 'pi pi-check';
    if (status === 'En Proceso') return 'pi pi-cog pi-spin';
    return 'pi pi-circle-fill';
  }

  getTaskTagSeverity(status: string): string {
    if (status === 'Completada') return 'success';
    if (status === 'En Proceso') return 'info';
    return 'secondary';
  }
}
