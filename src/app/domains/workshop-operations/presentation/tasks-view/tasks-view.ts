import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TaskStore } from '../../application/task.store';
import { WorkOrderStore } from '../../application/work-order.store';
import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';

@Component({
  selector: 'app-tasks-view',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './tasks-view.html',
  styleUrl: './tasks-view.css',
})
export class TasksViewComponent implements OnInit {
  public taskStore = inject(TaskStore);
  private workOrderStore = inject(WorkOrderStore);
  private mechanicStore = inject(MechanicStore);
  private translate = inject(TranslateService);

  async ngOnInit() {
    await Promise.all([
      this.taskStore.loadAllTasks(),
      this.workOrderStore.loadWorkOrders(),
      this.mechanicStore.loadMechanics(),
    ]);
  }

  allMappedTasks = computed(() => {
    return this.taskStore.tasks().map((t) => {
      const order = this.workOrderStore
        .workOrders()
        .find((o) => String(o.id) === String(t.workOrderId));
      const mechanic = this.mechanicStore
        .mechanics()
        .find((m) => String(m.id) === String(t.mechanicId));
      return {
        ...t,
        orderCode: order?.trackingCode || this.translate.instant('tasks.fallbacks.unknown'),
        mechanicName: mechanic?.fullName || this.translate.instant('common.undefined'),
      };
    });
  });

  getTasksByStatus(status: string, adminReviewStatus?: string) {
    return this.allMappedTasks().filter(
      (t) =>
        t.status === status && (!adminReviewStatus || t.adminReviewStatus === adminReviewStatus),
    );
  }

  getTaskTotal(task: any): number {
    const labor = Number(task.laborPrice || 0);
    const partsTotal = (task.parts || []).reduce(
      (sum: number, p: any) => sum + Number(p.unitPrice || 0) * Number(p.quantity || 1),
      0,
    );
    return labor + partsTotal;
  }

  getPriorityLabel(priority: string | undefined): string {
    switch (priority) {
      case 'HIGH': return this.translate.instant('priorities.high');
      case 'LOW': return this.translate.instant('priorities.low');
      default: return this.translate.instant('priorities.medium');
    }
  }

  getPriorityClass(priority: string | undefined): string {
    if (priority === 'HIGH') return 'badge-danger';
    if (priority === 'LOW') return 'badge-secondary';
    return 'badge-warning';
  }

  async approveTask(id: string | number | undefined) {
    if (id) await this.taskStore.approveTask(id);
  }

  async rejectTask(id: string | number | undefined) {
    if (id) await this.taskStore.rejectTask(id);
  }
}
