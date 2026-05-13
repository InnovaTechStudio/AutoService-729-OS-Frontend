import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TaskStore } from '../../../workshop-operations/application/task.store';
import { Task } from '../../../workshop-operations/domain/models/work-order.model';
import { MechanicStore } from '../../application/mechanic.store';
import { Mechanic } from '../../domain/models/mechanic.model';
import { MechanicCardComponent, MechanicCardView } from './components/mechanic-card/mechanic-card';
import { MechanicDialogComponent } from './components/mechanic-dialog/mechanic-dialog';
import { MechanicFiltersComponent } from './components/mechanic-filters/mechanic-filters';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * MechanicsViewComponent
 *
 * Main standalone view for managing workshop mechanics.
 *
 * It connects the mechanic and task stores with the UI, providing mechanic
 * listing, filtering, workload calculation, effectiveness metrics, and dialog
 * actions for creating, editing, and deleting mechanics.
 *
 * @component
 * @standalone
 * @selector app-mechanics-view
 */
@Component({
  selector: 'app-mechanics-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MechanicFiltersComponent,
    MechanicCardComponent,
    MechanicDialogComponent,
    TranslatePipe,
  ],
  templateUrl: './mechanics-view.html',
  styleUrl: './mechanics-view.css',
})
export class MechanicsViewComponent implements OnInit {
  /**
   * Store responsible for managing mechanic data.
   */
  protected readonly mechanicStore = inject(MechanicStore);

  /**
   * Store responsible for managing workshop task data.
   */
  protected readonly taskStore = inject(TaskStore);

  protected readonly displayDialog = signal(false);
  protected readonly search = signal('');
  protected readonly selectedSpecialty = signal<string | null>(null);

  /**
   * Mechanic model used by the create and edit dialog form.
   */
  protected mechanicForm: Mechanic = this.getEmptyMechanic();

  /**
   * Available mechanic specialties displayed in the filter and form controls.
   */
  protected readonly specialtyOptions = [
    'Mecánica General',
    'Electricidad',
    'Planchado y Pintura',
    'Electrónica',
    'Frenos y Suspensión',
    'Motor y Transmisión',
  ];

  /**
   * Computed mechanic view models enriched with workload and effectiveness data.
   */
  protected readonly mechanicsView = computed<MechanicCardView[]>(() =>
    this.mechanicStore.mechanics().map((mechanic) => {
      const maxCapacity = Number(mechanic.maxCapacity || 5);
      const activeTasks = this.getActiveTasksCount(String(mechanic.id));
      const loadPercentage = this.calculateLoadPercentage(String(mechanic.id), maxCapacity);

      return {
        id: String(mechanic.id),
        raw: mechanic,
        fullName: mechanic.fullName,
        specialty: mechanic.specialty || 'Mecánica General',
        maxCapacity,
        activeTasks,
        loadPercentage,
        workloadStatus: this.getWorkloadStatus(loadPercentage),
        loadClass: this.getLoadClass(loadPercentage),
        effectiveness: this.calculateEffectiveness(String(mechanic.id)),
      };
    }),
  );

  /**
   * Computed list of mechanics filtered by search term and selected specialty.
   */
  protected readonly filteredMechanics = computed(() => {
    const term = this.search().toLowerCase().trim();
    const selectedSpecialty = this.selectedSpecialty();

    return this.mechanicsView().filter((mechanic) => {
      const matchesSearch =
        !term ||
        mechanic.fullName.toLowerCase().includes(term) ||
        mechanic.specialty.toLowerCase().includes(term);

      const matchesSpecialty = !selectedSpecialty || mechanic.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  });

  /**
   * Number of mechanics with available workload capacity.
   */
  protected readonly availableMechanics = computed(
    () => this.mechanicsView().filter((mechanic) => mechanic.loadPercentage < 70).length,
  );

  /**
   * Number of mechanics with high workload.
   */
  protected readonly highLoadMechanics = computed(
    () => this.mechanicsView().filter((mechanic) => mechanic.loadPercentage >= 70).length,
  );

  /**
   * Loads mechanics and tasks when the view is initialized.
   */
  ngOnInit(): void {
    this.mechanicStore.loadMechanics();

    if (this.taskStore.tasks().length === 0) {
      this.taskStore.loadAllTasks();
    }
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  protected onSpecialtyChange(value: string | null): void {
    this.selectedSpecialty.set(value);
  }

  /**
   * Opens the dialog with an empty mechanic form.
   */
  protected openDialog(): void {
    this.mechanicForm = this.getEmptyMechanic();
    this.displayDialog.set(true);
  }

  /**
   * Opens the dialog with the selected mechanic data.
   *
   * @param mechanic - Mechanic selected for editing.
   */
  protected editMechanic(mechanic: Mechanic): void {
    this.mechanicForm = {
      ...mechanic,
      maxCapacity: mechanic.maxCapacity || 5,
      status: mechanic.status || 'Disponible',
    };
    this.displayDialog.set(true);
  }

  /**
   * Closes the dialog and resets the mechanic form.
   */
  protected hideDialog(): void {
    this.displayDialog.set(false);
    this.mechanicForm = this.getEmptyMechanic();
  }

  /**
   * Saves the mechanic form by creating a new mechanic or updating an existing one.
   */
  protected saveMechanic(): void {
    if (!this.mechanicForm.fullName || !this.mechanicForm.specialty) {
      return;
    }

    if (this.mechanicForm.id) {
      this.mechanicStore.updateMechanic(this.mechanicForm.id, this.mechanicForm);
    } else {
      this.mechanicStore.addMechanic(this.mechanicForm);
    }

    this.hideDialog();
  }

  /**
   * Deletes the selected mechanic after user confirmation.
   *
   * @param mechanic - Mechanic selected for deletion.
   */
  protected deleteMechanic(mechanic: Mechanic): void {
    if (!mechanic.id) {
      return;
    }

    const confirmed = window.confirm(`¿Eliminar a ${mechanic.fullName}?`);

    if (!confirmed) {
      return;
    }

    this.mechanicStore.deleteMechanic(mechanic.id);
  }

  /**
   * Gets the number of active tasks assigned to a mechanic.
   *
   * @param mechanicId - Identifier of the mechanic.
   * @returns Number of assigned tasks that are not completed.
   */
  private getActiveTasksCount(mechanicId: string): number {
    return this.taskStore
      .tasks()
      .filter(
        (task) => String(task.mechanicId) === String(mechanicId) && task.status !== 'Completada',
      ).length;
  }

  /**
   * Calculates the mechanic workload percentage based on active tasks and capacity.
   *
   * @param mechanicId - Identifier of the mechanic.
   * @param maxCapacity - Maximum task capacity of the mechanic.
   * @returns Workload percentage limited to a maximum of 100.
   */
  private calculateLoadPercentage(mechanicId: string, maxCapacity: number): number {
    const max = Number(maxCapacity) || 1;
    const count = this.getActiveTasksCount(mechanicId);

    return Math.min(Math.round((count / max) * 100), 100);
  }

  private getWorkloadStatus(loadPercentage: number): string {
    if (loadPercentage >= 100) return 'Al máximo';
    if (loadPercentage >= 70) return 'Carga alta';
    return 'Disponible';
  }

  private getLoadClass(loadPercentage: number): string {
    if (loadPercentage >= 100) return 'load-high';
    if (loadPercentage >= 70) return 'load-medium';
    return 'load-low';
  }

  /**
   * Calculates the effectiveness percentage of a mechanic.
   *
   * @param mechanicId - Identifier of the mechanic.
   * @returns Percentage of completed tasks assigned to the mechanic.
   */
  private calculateEffectiveness(mechanicId: string): number {
    const mechanicTasks: Task[] = this.taskStore
      .tasks()
      .filter((task) => String(task.mechanicId) === String(mechanicId));

    if (!mechanicTasks.length) {
      return 0;
    }

    const completed = mechanicTasks.filter((task) => task.status === 'Completada').length;

    return Math.round((completed / mechanicTasks.length) * 100);
  }

  /**
   * Creates an empty mechanic model with default values.
   *
   * @returns Default mechanic object used by the dialog form.
   */
  private getEmptyMechanic(): Mechanic {
    return {
      fullName: '',
      specialty: 'Mecánica General',
      phone: '',
      status: 'Disponible',
      maxCapacity: 5,
    };
  }
}
