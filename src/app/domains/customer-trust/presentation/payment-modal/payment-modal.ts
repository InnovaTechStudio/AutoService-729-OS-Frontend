import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.css',
})
export class PaymentModalComponent {
  public dialogRef = inject(MatDialogRef<PaymentModalComponent>);
  public data = inject(MAT_DIALOG_DATA);

  order = this.data.order;
  workshop = this.data.workshop;

  paymentData = {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  };

  isProcessing = false;

  close() {
    this.dialogRef.close(false);
  }

  simulatePayment() {
    if (!this.paymentData.cardNumber || !this.paymentData.cvv) return;

    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.dialogRef.close(true); // Retorna true en caso de éxito
    }, 2000);
  }
}
