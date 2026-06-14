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

  progressPercentage = computed(() => {
    const order = this.trackingStore.order();
    const tasks = this.trackingStore.tasks();

    if (!order) return 0;
    if (order.status === 'FINISHED' || order.status === 'DELIVERED') return 100;
    if (!tasks || tasks.length === 0) return 0;

    const completed = tasks.filter((t: any) => t.status === 'COMPLETED').length;
    return Math.round((completed / tasks.length) * 100);
  });

  orderIsFinished = computed(() => this.trackingStore.order()?.status === 'FINISHED');
  orderIsDelivered = computed(() => this.trackingStore.order()?.status === 'DELIVERED');

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
