import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';
import { TaskStore } from '../../../workshop-operations/application/task.store';
import { AuthState } from '../../../auth/application/auth.state';
import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';

@Component({
  selector: 'app-mechanic-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslateModule,
  ],
  templateUrl: './mechanic-dashboard.component.html',
  styleUrl: './mechanic-dashboard.component.css',
})
export class MechanicDashboardComponent implements OnInit {
  private workOrderStore = inject(WorkOrderStore);
  private taskStore = inject(TaskStore);
  private mechanicStore = inject(MechanicStore);
  public vehicleStore = inject(VehicleStore);
  private authState = inject(AuthState);
  private router = inject(Router);
  public translate = inject(TranslateService);

  async ngOnInit() {
    await Promise.all([
      this.workOrderStore.loadWorkOrders(),
      this.taskStore.loadAllTasks(),
      this.mechanicStore.loadMechanics(),
      this.vehicleStore.loadVehicles(),
    ]);
  }

  // Solución al problema de filtrado: cruzamos por email si el mechanicId no viene en el token
  me = computed(() => {
    const user = this.authState.currentUser();
    if (!user) return null;
    return (
      this.mechanicStore
        .mechanics()
        .find((m) => String(m.id) === String(user.mechanicId) || m.email === user.email) || {
        fullName: user.email || 'Mecánico',
        specialty: 'Técnico',
        id: user.mechanicId,
      }
    );
  });

  myOrders = computed(() => {
    const myId = this.me()?.id;
    if (!myId) return [];
    return this.workOrderStore.workOrders().filter((o) => String(o.mechanicId) === String(myId));
  });

  stats = computed(() => {
    const orders = this.myOrders();
    return {
      pending: orders.filter((o) => o.status === 'PENDING').length,
      inProgress: orders.filter((o) => o.status === 'IN_PROGRESS').length,
      completed: orders.filter((o) => o.status === 'FINISHED').length,
    };
  });

  getVehicleDetails(vehicleId: string | number | undefined) {
    const v = this.vehicleStore.vehicles().find((x) => String(x.id) === String(vehicleId));
    return v ? `${v.brand} ${v.model}` : 'Vehículo';
  }

  getTaskCount(orderId: string | number | undefined) {
    return this.taskStore.tasks().filter((t) => String(t.workOrderId) === String(orderId)).length;
  }

  getLaborTotal(orderId: string | number | undefined) {
    const tasks = this.taskStore.tasks().filter((t) => String(t.workOrderId) === String(orderId));
    return tasks.reduce((sum, task) => sum + Number((task as any).laborPrice || 0), 0);
  }

  getCompletedTasks(orderId: string | number | undefined) {
    return this.taskStore
      .tasks()
      .filter((t) => String(t.workOrderId) === String(orderId) && t.status === 'COMPLETED').length;
  }

  getTotalTasks(orderId: string | number | undefined) {
    return this.taskStore.tasks().filter((t) => String(t.workOrderId) === String(orderId)).length;
  }

  getProgress(orderId: string | number | undefined) {
    const total = this.getTotalTasks(orderId);
    return total ? Math.round((this.getCompletedTasks(orderId) / total) * 100) : 0;
  }

  getSeverityClass(status: string) {
    if (status === 'FINISHED') return 'badge-success';
    if (status === 'IN_PROGRESS') return 'badge-info';
    return 'badge-warning';
  }

  logout() {
    this.authState.clearSession();
    this.router.navigate(['/login']);
  }

  goToOrder(id: string | number | undefined) {
    if (id) this.router.navigate([`/mechanic/order/${id}`]);
  }
}
