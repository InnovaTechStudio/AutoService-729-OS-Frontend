/**
 * WorkOrderCardComponent
 *
 * Reusable card component for displaying a visual summary
 * of a Work Order. It is primarily used in lists and general views.
 *
 * @component
 * @selector app-work-order-card
 * @standalone true
 */
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { WorkOrder } from '../../../../domain/models/work-order.model';
import { TranslatePipe } from '@ngx-translate/core';

export interface WorkOrderCardView {
  id: string;
  raw: WorkOrder;
  trackingCode: string;
  vehicleName: string;
  plateOnly: string;
  customerName: string;
  progress: number;
  startDate: string;
  estimatedDate: string;
  status: WorkOrder['status'];
  price: number;
  isRisk: boolean;
  riskStatus: string;
  riskClass: string;
}
@Component({
  selector: 'app-work-order-card',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslatePipe,
  ],
  templateUrl: './work-order-card.html',
  styleUrl: './work-order-card.css',
})
export class WorkOrderCardComponent {
  /** Data for the order in an enriched format for the view */
  @Input({ required: true }) order!: WorkOrderCardView;

  /** Event emitted when clicking "View Details" */
  @Output() viewDetail = new EventEmitter<WorkOrder>();

  protected onViewDetail(): void {
    this.viewDetail.emit(this.order.raw);
  }

  /**
   * Returns the CSS class based on the order's status.
   */
  protected getStatusClass(status: WorkOrder['status']): string {
    if (status === 'Finalizado') return 'status-success';
    if (status === 'Cancelado') return 'status-danger';
    if (status === 'Pendiente') return 'status-warning';

    return 'status-info';
  }
}
