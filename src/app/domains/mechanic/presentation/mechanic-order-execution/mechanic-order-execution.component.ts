import { Component, computed, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { WorkOrderStore } from '../../../workshop-operations/application/work-order.store';
import { TaskStore } from '../../../workshop-operations/application/task.store';
import { VehicleStore } from '../../../fleet-management/application/vehicle.store';
import { AuthState } from '../../../auth/application/auth.state';
import { InventoryStore } from '../../../inventory-management/application/inventory.store';
import { ObdScannerService } from '../../infrastructure/services/obd-scanner.service';
import { ObdFault, ObdScanResult } from '../../domain/obd-fault.model';

@Component({
  selector: 'app-mechanic-order-execution',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    TranslatePipe,
  ],
  templateUrl: './mechanic-order-execution.component.html',
  styleUrl: './mechanic-order-execution.component.css',
})
export class MechanicOrderExecutionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  public translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  private workOrderStore = inject(WorkOrderStore);
  private taskStore = inject(TaskStore);
  private vehicleStore = inject(VehicleStore);
  private authState = inject(AuthState);
  public inventoryStore = inject(InventoryStore);
  private obdScanner = inject(ObdScannerService);

  @ViewChild('taskDialogTemplate') taskDialogTemplate!: TemplateRef<any>;

  orderId = this.route.snapshot.paramMap.get('id');
  diagnosis = signal('');

  scannerStatus = signal<'idle' | 'connecting' | 'reading' | 'done'>('idle');
  scanResult = signal<ObdScanResult | null>(null);

  priorities = [
    { value: 'LOW', label: this.translate.instant('priorities.low') || 'Baja' },
    { value: 'MEDIUM', label: this.translate.instant('priorities.medium') || 'Media' },
    { value: 'HIGH', label: this.translate.instant('priorities.high') || 'Alta' },
  ];

  newTask = signal({
    description: '',
    priority: 'MEDIUM',
    estimatedTime: 1.0,
    laborPrice: 0.0,
    parts: [] as any[],
    technicalDiagnosis: '',
  });

  async ngOnInit() {
    await Promise.all([
      this.workOrderStore.loadWorkOrders(),
      this.taskStore.loadAllTasks(),
      this.vehicleStore.loadVehicles(),
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
  isOrderClosed = computed(() => this.order()?.status === 'FINISHED');

  totalLabor = computed(() =>
    this.tasks().reduce((sum, task) => sum + Number((task as any).laborPrice || 0), 0),
  );

  totalOrderCost = computed(() => {
    return this.tasks().reduce((sum, task) => {
      const labor = Number((task as any).laborPrice || 0);
      const partsTotal = ((task as any).parts || []).reduce(
        (pSum: number, part: any) =>
          pSum + Number(part.unitPrice || 0) * Number(part.quantity || 1),
        0,
      );
      return sum + labor + partsTotal;
    }, 0);
  });

  completedTasks = computed(() => this.tasks().filter((t) => t.status === 'COMPLETED').length);
  progress = computed(() =>
    this.tasks().length ? Math.round((this.completedTasks() / this.tasks().length) * 100) : 0,
  );

  async updateOrderPrice() {
    if (this.orderId) {
      await this.workOrderStore.updateOrderAutoPrice(this.orderId, this.totalOrderCost());
    }
  }

  openTaskDialog() {
    this.newTask.set({
      description: '',
      priority: 'MEDIUM',
      estimatedTime: 1.0,
      laborPrice: 0.0,
      parts: [],
      technicalDiagnosis: '',
    });
    this.dialog.open(this.taskDialogTemplate, {
      width: '640px',
      panelClass: 'custom-dialog-container',
    });
  }

  openTaskDialogFromFault(fault: ObdFault) {
    this.newTask.set({
      description: fault.title,
      priority: fault.severity,
      estimatedTime: fault.suggestedEstimatedTime,
      laborPrice: fault.suggestedLaborPrice,
      parts: [],
      technicalDiagnosis: `${fault.code} - ${fault.description}`,
    });
    this.dialog.open(this.taskDialogTemplate, {
      width: '640px',
      panelClass: 'custom-dialog-container',
    });
  }

  runScan() {
    if (this.scannerStatus() === 'connecting' || this.scannerStatus() === 'reading') return;
    this.scanResult.set(null);
    this.scannerStatus.set('connecting');

    setTimeout(() => {
      this.scannerStatus.set('reading');
      this.obdScanner.scan(this.vehicle()?.plate).subscribe((result) => {
        this.scanResult.set(result);
        this.scannerStatus.set('done');
      });
    }, 900);
  }

  resetScan() {
    this.scannerStatus.set('idle');
    this.scanResult.set(null);
  }

  getFaultSeverityLabel(severity: string): string {
    if (severity === 'HIGH') return this.translate.instant('obdScanner.severity.high');
    if (severity === 'MEDIUM') return this.translate.instant('obdScanner.severity.medium');
    return this.translate.instant('obdScanner.severity.low');
  }

  getFaultSeverityClass(severity: string): string {
    if (severity === 'HIGH') return 'badge-danger';
    if (severity === 'MEDIUM') return 'badge-warning';
    return 'badge-secondary';
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

  newTaskTotalCost = computed(() => {
    const t = this.newTask();
    const labor = Number(t.laborPrice || 0);
    const parts = t.parts.reduce(
      (sum, part) => sum + Number(part.unitPrice || 0) * Number(part.quantity || 1),
      0,
    );
    return labor + parts;
  });

  async createTask() {
    if (this.isOrderClosed() || !this.newTask().description) return;

    const taskPayload: any = {
      workOrderId: Number(this.orderId),
      mechanicId: this.order()?.mechanicId,
      ...this.newTask(),
    };

    await this.taskStore.addTask(taskPayload);
    await this.updateOrderPrice();
    this.closeDialog();
  }

  async startTask(task: any) {
    if (this.isOrderClosed() || task.status !== 'PENDING') return;
    await this.taskStore.updateTask(task.id, { ...task, status: 'IN_PROGRESS' });
  }

  async completeTask(task: any) {
    if (this.isOrderClosed() || task.status !== 'IN_PROGRESS') return;
    await this.taskStore.updateTask(task.id, { ...task, status: 'COMPLETED' });
    await this.updateOrderPrice();
  }

  getTaskStatusLabel(status: string): string {
    if (status === 'IN_PROGRESS') return this.translate.instant('taskStatus.in_progress');
    if (status === 'COMPLETED') return this.translate.instant('taskStatus.completed');
    return this.translate.instant('taskStatus.pending');
  }

  getPriorityLabel(priorityValue: string) {
    const found = this.priorities.find((p) => p.value === priorityValue);
    return found ? found.label : priorityValue;
  }
}
