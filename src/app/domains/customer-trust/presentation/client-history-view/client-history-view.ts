import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VehicleHistoryStore } from '../../../vehicle-history/application/vehicle-history.store';

@Component({
  selector: 'app-client-history-view',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './client-history-view.html',
  styleUrl: './client-history-view.css'
})
export class ClientHistoryViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly vehicleHistoryStore = inject(VehicleHistoryStore);

  plate: string = '';
  currentDate = new Date();

  ngOnInit(): void {
    this.plate = this.route.snapshot.paramMap.get('plate') || '';
    if (this.plate) {
      this.vehicleHistoryStore.loadByPlate(this.plate);
    }
  }

  goBack(): void {
    this.router.navigate(['/tracking']);
  }

  downloadPDF(): void {
    window.print();
  }
}
