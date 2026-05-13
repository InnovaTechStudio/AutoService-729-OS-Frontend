/**
 * WorkOrderFiltersComponent
 *
 * Reusable filter component for the work order list.
 * It allows users to filter work orders by search text and order status.
 *
 * The component receives the current filter values and available status options
 * from the parent component, then emits changes whenever the user updates a filter.
 *
 * @component
 * @selector app-work-order-filters
 * @standalone true
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

import { WorkOrder } from '../../../../domain/models/work-order.model';

@Component({
  selector: 'app-work-order-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './work-order-filters.html',
  styleUrl: './work-order-filters.css'
})
export class WorkOrderFiltersComponent {

  /**
   * Current search term used to filter work orders.
   */
  @Input() search = '';

  /**
   * Current selected work order status.
   * A null value means that all statuses are selected.
   */
  @Input() status: WorkOrder['status'] | null = null;

  /**
   * Available work order status options received from the parent component.
   */
  @Input() statusOptions: WorkOrder['status'][] = [];

  /**
   * Event emitted when the search term changes.
   */
  @Output() searchChange = new EventEmitter<string>();

  /**
   * Event emitted when the selected status changes.
   */
  @Output() statusChange = new EventEmitter<WorkOrder['status'] | null>();

  /**
   * Emits the updated search term to the parent component.
   *
   * @param value New search text.
   */
  protected onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  /**
   * Emits the updated selected status to the parent component.
   *
   * @param value New selected status or null when all statuses are selected.
   */
  protected onStatusChange(value: WorkOrder['status'] | null): void {
    this.statusChange.emit(value);
  }

  /**
   * Returns the translation key for a work order status.
   *
   * @param status Work order status value.
   * @returns Translation key for the status label.
   */
  protected getStatusTranslationKey(status: WorkOrder['status']): string {
    if (status === 'Pendiente') return 'WORK_ORDER_FILTERS.STATUS.PENDING';
    if (status === 'En Proceso') return 'WORK_ORDER_FILTERS.STATUS.IN_PROGRESS';
    if (status === 'Finalizado') return 'WORK_ORDER_FILTERS.STATUS.FINISHED';
    if (status === 'Cancelado') return 'WORK_ORDER_FILTERS.STATUS.CANCELLED';

    return 'WORK_ORDER_FILTERS.STATUS.UNKNOWN';
  }
}