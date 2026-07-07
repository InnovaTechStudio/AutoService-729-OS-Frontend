import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/language-switcher/language-switcher';
import { TrackingStore } from '../../application/tracking.store';
import { PaymentModalComponent } from '../payment-modal/payment-modal';

@Component({
  selector: 'app-tracking-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    TranslateModule,
    LanguageSwitcher,
  ],
  templateUrl: './tracking-view.html',
  styleUrl: './tracking-view.css',
})
export class TrackingViewComponent {
  public trackingStore = inject(TrackingStore);
  public translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  trackingCode = '';
  today = new Date();

  progressPercentage = computed(() => {
    const order = this.trackingStore.order();
    const tasks = this.trackingStore.tasks();

    if (!order) return 0;
    if (order.status === 'FINISHED' || order.status === 'DELIVERED') return 100;
    if (!tasks || tasks.length === 0) return 0;

    const completed = tasks.filter((t: any) => t.status === 'COMPLETED').length;
    return Math.round((completed / tasks.length) * 100);
  });

  activeStep = computed(() => {
    const order = this.trackingStore.order();
    if (!order) return 0;
    if (order.status === 'FINISHED' || order.status === 'DELIVERED') return 3;
    if (order.status === 'IN_PROGRESS') return 2;
    if (this.trackingStore.tasks().length > 0) return 1;
    return 0;
  });

  orderIsFinished = computed(() => this.trackingStore.order()?.status === 'FINISHED');
  orderIsDelivered = computed(() => this.trackingStore.order()?.status === 'DELIVERED');

  totalLabor = computed(() =>
    this.trackingStore
      .tasks()
      .reduce((sum, task: any) => sum + Number(task.laborPrice || 0), 0),
  );

  totalParts = computed(() =>
    this.trackingStore.tasks().reduce((sum, task: any) => {
      const partsTotal = (task.parts || []).reduce(
        (pSum: number, p: any) => pSum + Number(p.unitPrice || 0) * Number(p.quantity || 1),
        0,
      );
      return sum + partsTotal;
    }, 0),
  );

  getTaskTotal(task: any): number {
    const labor = Number(task.laborPrice || 0);
    const partsTotal = (task.parts || []).reduce(
      (sum: number, p: any) => sum + Number(p.unitPrice || 0) * Number(p.quantity || 1),
      0,
    );
    return labor + partsTotal;
  }

  search() {
    if (this.trackingCode.trim()) {
      this.trackingStore.searchOrder(this.trackingCode.trim());
    }
  }

  getSeverityClass(status: string): string {
    if (status === 'FINISHED' || status === 'COMPLETED' || status === 'DELIVERED')
      return 'badge-success';
    if (status === 'IN_PROGRESS') return 'badge-info';
    return 'badge-warning';
  }

  getOrderStatusLabel(status: string | undefined): string {
    if (!status) return '';
    return this.translate.instant('orderStatus.' + status.toLowerCase()) || status;
  }

  getTaskStatusLabel(status: string | undefined): string {
    if (!status) return '';
    return this.translate.instant('taskStatus.' + status.toLowerCase()) || status;
  }

  openPaymentModal() {
    const dialogRef = this.dialog.open(PaymentModalComponent, {
      width: '450px',
      panelClass: 'custom-dialog-container',
      data: {
        order: this.trackingStore.order(),
        workshop: this.trackingStore.workshop(),
      },
    });

    dialogRef.afterClosed().subscribe(async (success) => {
      if (success) {
        await this.trackingStore.processPayment();
      }
    });
  }

  printReceipt() {
    window.print();
  }
}
