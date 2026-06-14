import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { WorkOrderStore } from '../../application/work-order.store';
import { TaskStore } from '../../application/task.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    TranslateModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  public workOrderStore = inject(WorkOrderStore);
  public taskStore = inject(TaskStore);
  public vehicleStore = inject(VehicleStore);
  private router = inject(Router);

  async ngOnInit() {
    await Promise.all([
      this.workOrderStore.loadWorkOrders(),
      this.taskStore.loadAllTasks(),
      this.vehicleStore.loadVehicles(),
    ]);
  }

  activeOrdersCount = computed(
    () =>
      this.workOrderStore.workOrders().filter((o) => ['PENDING', 'IN_PROGRESS'].includes(o.status))
        .length,
  );
  completedOrdersCount = computed(
    () =>
      this.workOrderStore.workOrders().filter((o) => ['FINISHED', 'DELIVERED'].includes(o.status))
        .length,
  );
  projectedIncome = computed(() =>
    this.workOrderStore
      .workOrders()
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.price || 0), 0),
  );

  vehiclesInWorkshop = computed(() => {
    const activeVehicleIds = this.workOrderStore
      .workOrders()
      .filter((o) => ['PENDING', 'IN_PROGRESS'].includes(o.status))
      .map((o) => o.vehicleId);
    return new Set(activeVehicleIds).size;
  });

  recentOrders = computed(() => [...this.workOrderStore.workOrders()].reverse().slice(0, 5));

  activeVehiclesList = computed(() => {
    return this.workOrderStore
      .workOrders()
      .filter((o) => ['PENDING', 'IN_PROGRESS'].includes(o.status))
      .slice(0, 4)
      .map((order) => {
        const vehicle = this.vehicleStore
          .vehicles()
          .find((v) => String(v.id) === String(order.vehicleId));
        return {
          orderCode: order.trackingCode,
          plate: vehicle?.plate,
          name: `${vehicle?.brand} ${vehicle?.model}`,
          image:
            vehicle?.image ||
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&auto=format&fit=crop',
          progress: order.status === 'IN_PROGRESS' ? 65 : 20,
        };
      });
  });

  frequentServicesList = computed(() => {
    const taskMap: Record<string, any> = {};
    this.taskStore.tasks().forEach((task) => {
      const desc = task.description || 'Servicio General';
      if (!taskMap[desc]) taskMap[desc] = { name: desc, count: 0 };
      taskMap[desc].count += 1;
    });
    const sorted = Object.values(taskMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    const maxCount = sorted[0]?.count || 1;
    const icons = ['settings', 'build', 'bolt'];
    return sorted.map((s, i) => ({
      ...s,
      progress: Math.round((s.count / maxCount) * 100),
      icon: icons[i % icons.length],
    }));
  });

  weeklyIncomeData = computed(() => {
    let totalWeek = 0;
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);
      const dateString = currentDate.toISOString().split('T')[0];
      const dayTotal = this.workOrderStore
        .workOrders()
        .filter((o) => o.startDate === dateString)
        .reduce((sum, o) => sum + Number(o.price || 0), 0);
      data.push({
        label: currentDate
          .toLocaleDateString('es-ES', { weekday: 'short' })
          .toUpperCase()
          .replace('.', ''),
        value: dayTotal,
        height: 0,
      });
      totalWeek += dayTotal;
    }
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    data.forEach((d) => (d.height = Math.max(Math.round((d.value / maxVal) * 100), 5))); // Altura mínima 5%
    return { total: totalWeek, data };
  });

  getOrderSeverity(status: string) {
    if (status === 'FINISHED' || status === 'DELIVERED') return 'success';
    if (status === 'IN_PROGRESS') return 'info';
    if (status === 'CANCELLED') return 'danger';
    return 'warning';
  }

  goToCreate() {
    this.router.navigate(['/work-orders/new']);
  }
  goToOrders() {
    this.router.navigate(['/work-orders']);
  }
  goToVehicles() {
    this.router.navigate(['/vehicles']);
  }
}
