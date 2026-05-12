import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, FormsModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.css'
})
export class PaymentModalComponent {
  amount: number = 0;
  selectedMethod: string = 'Tarjeta';

  constructor(
    public dialogRef: MatDialogRef<PaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { amount: number }
  ) {
    if (data && data.amount) {
      this.amount = data.amount;
    }
  }

  processPayment() {
    alert(`Pago realizado con ${this.selectedMethod}`);
    this.dialogRef.close(true);
  }

  closeModal() {
    this.dialogRef.close(false);
  }
}
