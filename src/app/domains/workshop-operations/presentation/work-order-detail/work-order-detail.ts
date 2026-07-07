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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WorkOrderStore } from '../../application/work-order.store';
import { TaskStore } from '../../application/task.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { MechanicStore } from '../../../staff-coordination/application/mechanic.store';
import { InventoryStore } from '../../../inventory-management/application/inventory.store';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
  public inventoryStore = inject(InventoryStore);

  @ViewChild('taskDialog') taskDialogTemplate!: TemplateRef<any>;

  orderId = this.route.snapshot.paramMap.get('id');

  newTask = signal({
    description: '',
    priority: 'MEDIUM',
    estimatedTime: 1,
    laborPrice: 0,
    mechanicId: null as string | number | null,
    parts: [] as any[],
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
          tasksCompleted: (currentOrder as any).tasksCompleted || false,
          sparePartsChecked: (currentOrder as any).sparePartsChecked || false,
          diagnosisValidated: (currentOrder as any).diagnosisValidated || false,
          cleaningDone: (currentOrder as any).cleaningDone || false,
          finalTestDone: (currentOrder as any).finalTestDone || false,
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
      this.inventoryStore.loadItems(),
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
    if (!currentOrder || currentOrder.status === 'FINISHED' || currentOrder.status === 'DELIVERED')
      return false;
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

  getTaskTotal(task: any): number {
    const labor = Number(task.laborPrice || 0);
    const partsTotal = (task.parts || []).reduce(
      (sum: number, p: any) => sum + Number(p.unitPrice) * Number(p.quantity),
      0,
    );
    return labor + partsTotal;
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
      mechanicId: this.order()?.mechanicId as any,
      parts: [] as any[],
    });
    this.dialog.open(this.taskDialogTemplate, {
      width: '640px',
      panelClass: 'custom-dialog-container',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  addPart() {
    this.newTask.update((t) => {
      t.parts.push({ inventoryItemId: null, name: '', quantity: 1, unitPrice: 0 });
      return t;
    });
  }

  removePart(index: number) {
    this.newTask.update((t) => {
      t.parts.splice(index, 1);
      return t;
    });
  }

  onPartSelected(itemId: any, index: number) {
    const item = this.inventoryStore.items().find((i) => String(i.id) === String(itemId));
    if (item) {
      this.newTask.update((t) => {
        t.parts[index].name = item.name;
        t.parts[index].unitPrice = item.unitPrice;
        return t;
      });
    }
  }

  async updateOrderPrice() {
    if (!this.orderId) return;
    const total = this.tasks().reduce((sum, task) => {
      const labor = Number((task as any).laborPrice || 0);
      const partsTotal = ((task as any).parts || []).reduce(
        (pSum: number, p: any) => pSum + Number(p.unitPrice) * Number(p.quantity),
        0,
      );
      return sum + labor + partsTotal;
    }, 0);
    await this.workOrderStore.updateOrderAutoPrice(this.orderId, total);
  }

  async saveTask() {
    if (!this.newTask().description || !this.newTask().mechanicId) return;
    await this.taskStore.addTask({
      ...this.newTask(),
      workOrderId: this.orderId!,
      status: 'PENDING',
      adminReviewStatus: 'PENDING',
    });
    await this.updateOrderPrice();
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

  async markAsDelivered() {
    if (!this.orderId || this.order()?.status !== 'FINISHED') return;
    await this.workOrderStore.markAsDelivered(this.orderId);
  }
}
