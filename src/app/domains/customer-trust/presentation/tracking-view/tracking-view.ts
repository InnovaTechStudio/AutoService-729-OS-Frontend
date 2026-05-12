/**
 * TrackingViewComponent
 * 
 * Component that allows users to search and view the current status
 * of a work order using its tracking code.
 * Displays information about the vehicle, the order, and the progress of the tasks.
 * 
 * @component
 * @selector app-tracking-view
 * @standalone true
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper'; // Para el Timeline
import { TrackingStore } from '../../application/tracking.store';

@Component({
  selector: 'app-tracking-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatStepperModule],
  templateUrl: './tracking-view.html',
  styleUrl: './tracking-view.css'
})
export class TrackingViewComponent {
  trackingStore = inject(TrackingStore);

  /** Tracking code entered by the user */
  trackingCode = '';

  /**
   * Performs the search for a work order using the entered code.
   */
  handleSearch() {
    if (this.trackingCode) {
      this.trackingStore.searchOrder(this.trackingCode);
    }
  }

  /**
   * Returns the icon corresponding to the status of a task.
   * 
   * @param status - Status of the task
   * @returns Name of the Material Icons icon
   */
  getTaskIcon(status: string): string {
    if (status === 'Completada') return 'check_circle';
    if (status === 'En Proceso') return 'settings';
    return 'schedule';
  }
}
