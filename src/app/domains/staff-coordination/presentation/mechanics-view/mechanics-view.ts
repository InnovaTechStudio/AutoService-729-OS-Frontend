import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { MechanicStore } from '../../application/mechanic.store';
import { TaskStore } from '../../../workshop-operations/application/task.store';
import { Mechanic } from '../../domain/models/mechanic.model';

@Component({
  selector: 'app-mechanics-view',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatSelectModule
  ],
  templateUrl: './mechanics-view.html',
  styleUrl: './mechanics-view.css'
})
export class MechanicsViewComponent implements OnInit {
  mechanicStore = inject(MechanicStore);
  taskStore = inject(TaskStore);
  private dialog = inject(MatDialog);

  @ViewChild('mechanicDialog') mechanicDialogTemplate!: TemplateRef<any>;

  newMechanic: Mechanic = this.getEmptyMechanic();
  specialties = ['Mecánica General', 'Electricidad', 'Planchado y Pintura', 'Electrónica'];

  ngOnInit() {
    this.mechanicStore.loadMechanics();
    this.taskStore.loadAllTasks(); // Necesario para calcular la carga
  }

  // Lógica de Negocio (Carga Laboral)
  getActiveTasksCount(mechanicId: string | undefined): number {
    if (!mechanicId) return 0;
    return this.taskStore.tasks().filter(t =>
      String(t.mechanicId) === String(mechanicId) && t.status !== 'Completada'
    ).length;
  }

  calculateLoadPercentage(id: string | undefined, max: number): number {
    const count = this.getActiveTasksCount(id);
    return Math.min((count / max) * 100, 100);
  }

  getWorkloadStatus(id: string | undefined, max: number): string {
    const count = this.getActiveTasksCount(id);
    if (count >= max) return 'Al Máximo';
    if (count >= max * 0.7) return 'Carga Alta';
    return 'Disponible';
  }

  getLoadClass(id: string | undefined, max: number): string {
    const count = this.getActiveTasksCount(id);
    if (count >= max) return 'bg-red';
    if (count >= max * 0.7) return 'bg-orange';
    return 'bg-green';
  }

  // Manejo del Modal
  openDialog() {
    this.newMechanic = this.getEmptyMechanic();
    this.dialog.open(this.mechanicDialogTemplate, { width: '400px' });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  saveMechanic() {
    if (this.newMechanic.fullName && this.newMechanic.specialty) {
      this.mechanicStore.addMechanic(this.newMechanic);
      this.closeDialog();
    }
  }

  private getEmptyMechanic(): Mechanic {
    return { fullName: '', specialty: '', maxCapacity: 5 };
  }
}
