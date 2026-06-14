import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { WorkOrderStore } from '../../application/work-order.store';
import { TaskStore } from '../../application/task.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './work-order-detail.html',
  styleUrl: './work-order-detail.css',
})
export class WorkOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  private workOrderStore = inject(WorkOrderStore);
  public taskStore = inject(TaskStore);
  private vehicleStore = inject(VehicleStore);
  public mechanicStore = inject(MechanicStore);

  @ViewChild('taskDialog') taskDialogTemplate!: TemplateRef<any>;

  orderId = this.route.snapshot.paramMap.get('id');

  newTask = signal({
    description: '',
    priority: 'MEDIUM',
    estimatedTime: 1,
    laborPrice: 0,
    mechanicId: null,
  });

  priorities = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
  ];

  checklist = {
    tasksCompleted: false,
    sparePartsChecked: false,
    diagnosisValidated: false,
    cleaningDone: false,
    finalTestDone: false,
  };

  constructor() {
    effect(() => {
      const currentOrder = this.order();
      if (currentOrder) {
        this.checklist = {
          tasksCompleted: currentOrder.tasksCompleted || false,
          sparePartsChecked: currentOrder.sparePartsChecked || false,
          diagnosisValidated: currentOrder.diagnosisValidated || false,
          cleaningDone: currentOrder.cleaningDone || false,
          finalTestDone: currentOrder.finalTestDone || false,
        };
      }
    });
  }

  async ngOnInit() {
    await Promise.all([
      this.workOrderStore.loadWorkOrders(),
      this.taskStore.loadAllTasks(),
      this.vehicleStore.loadVehicles(),
      this.mechanicStore.loadMechanics(),
    ]);
  }

  order = computed(() =>
    this.workOrderStore.workOrders().find((o) => String(o.id) === String(this.orderId)),
  );

  vehicle = computed(() =>
    this.vehicleStore.vehicles().find((v) => String(v.id) === String(this.order()?.vehicleId)),
  );

  tasks = computed(() =>
    this.taskStore.tasks().filter((t) => String(t.workOrderId) === String(this.orderId)),
  );

  canFinishOrder = computed(() => {
    const currentOrder = this.order();
    if (
      !currentOrder ||
      currentOrder.status === 'FINISHED' ||
      currentOrder.status === 'DELIVERED'
    ) {
      return false;
    }
    const allTasksCompleted =
      this.tasks().length > 0 && this.tasks().every((t) => t.status === 'COMPLETED');

    const allChecksDone = Object.values(this.checklist).every((val) => val === true);

    return allTasksCompleted && allChecksDone;
  });

  getSeverityClass(status: string | undefined): string {
    if (status === 'FINISHED' || status === 'COMPLETED' || status === 'DELIVERED')
      return 'badge-success';
    if (status === 'IN_PROGRESS') return 'badge-info';
    return 'badge-warning';
  }

  getMechanicName(id: string | number | null | undefined): string {
    if (!id) return 'Sin asignar';
    const m = this.mechanicStore.mechanics().find((x) => String(x.id) === String(id));
    return m ? m.fullName : 'Desconocido';
  }

  goBack() {
    this.router.navigate(['/work-orders']);
  }

  openTaskDialog() {
    this.newTask.set({
      description: '',
      priority: 'MEDIUM',
      estimatedTime: 1,
      laborPrice: 0,
      mechanicId: null,
    });
    this.dialog.open(this.taskDialogTemplate, {
      width: '500px',
      panelClass: 'custom-dialog-container',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  async saveTask() {
    if (!this.newTask().description || !this.newTask().mechanicId) return;
    await this.taskStore.addTask({
      ...this.newTask(),
      workOrderId: this.orderId!,
      status: 'PENDING',
      adminReviewStatus: 'PENDING',
    });
    this.closeDialog();
  }

  async saveChecklist() {
    if (!this.orderId) return;
    const currentOrder = this.order();
    if (currentOrder) {
      await this.workOrderStore.updateWorkOrderChecklist(this.orderId, {
        ...currentOrder,
        qaChecklist: this.checklist,
      });
    }
  }

  async finishOrder() {
    if (!this.canFinishOrder() || !this.orderId) return;
    const currentOrder = this.order();
    if (currentOrder) {
      await this.workOrderStore.updateWorkOrderChecklist(this.orderId, {
        ...currentOrder,
        status: 'FINISHED',
        qaChecklist: this.checklist,
      });
      this.router.navigate(['/work-orders']);
    }
  }
}
