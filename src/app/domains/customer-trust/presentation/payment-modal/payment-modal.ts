/**
 * PaymentModalComponent
 *
 * Modal component responsible for displaying the payment process.
 * It allows the user to select a payment method, view the total amount
 * to pay and confirm or cancel the payment operation.
 *
 * Supported payment methods:
 * - Yape
 * - Plin
 * - Card
 * - Cash
 *
 * @component
 * @selector app-payment-modal
 * @standalone true
 */
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.css'
})
export class PaymentModalComponent {

  /**
   * Total amount to be paid.
   */
  amount = 0;

  /**
   * Currently selected payment method.
   */
  selectedMethod: 'Yape' | 'Plin' | 'Card' | 'Cash' = 'Card';

  /**
   * Creates an instance of the payment modal component.
   *
   * @param dialogRef Reference used to close the modal.
   * @param data Data received from the parent component, including the amount to pay.
   * @param translate Translation service used for messages created in TypeScript.
   */
  constructor(
    public dialogRef: MatDialogRef<PaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { amount: number },
    private translate: TranslateService
  ) {
    if (data?.amount) {
      this.amount = data.amount;
    }
  }

  /**
   * Processes the selected payment method and closes the modal
   * returning a successful result.
   */
  processPayment(): void {
    const methodLabel = this.getSelectedMethodLabel();

    alert(`${this.translate.instant('PAYMENT.PAYMENT_SUCCESS')} ${methodLabel}`);

    this.dialogRef.close(true);
  }

  /**
   * Closes the modal without completing the payment.
   */
  closeModal(): void {
    this.dialogRef.close(false);
  }

  /**
   * Returns the translated label of the selected payment method.
   *
   * @returns Translated payment method label.
   */
  private getSelectedMethodLabel(): string {
    switch (this.selectedMethod) {
      case 'Card':
        return this.translate.instant('PAYMENT.CARD');

      case 'Cash':
        return this.translate.instant('PAYMENT.CASH');

      default:
        return this.selectedMethod;
    }
  }
}