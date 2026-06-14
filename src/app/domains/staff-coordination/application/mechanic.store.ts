import { Injectable, inject, signal } from '@angular/core';
import { MechanicService } from '../infrastructure/services/mechanic.service';
import { Mechanic } from '../domain/models/mechanic.model';

@Injectable({ providedIn: 'root' })
export class MechanicStore {
  private service = inject(MechanicService);

  readonly mechanics = signal<Mechanic[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadMechanics(): Promise<void> {
    this.loading.set(true);
    return new Promise((resolve, reject) => {
      this.service.getMechanics().subscribe({
        next: (data) => {
          this.mechanics.set(data);
          this.loading.set(false);
          resolve();
        },
        error: (err) => {
          console.error('Error fetching mechanics:', err);
          this.loading.set(false);
          reject(err);
        },
      });
    });
  }

  addMechanic(mechanic: Mechanic): Promise<Mechanic> {
    return new Promise((resolve, reject) => {
      this.service.createMechanic(mechanic).subscribe({
        next: (newMechanic) => {
          this.mechanics.update((list) => [...list, newMechanic]);
          resolve(newMechanic);
        },
        error: (err) => {
          this.error.set('mechanics.errors.createError');
          reject(err);
        },
      });
    });
  }

  updateMechanic(id: string | number, mechanic: Mechanic): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.updateMechanic(id, mechanic).subscribe({
        next: (updatedMechanic) => {
          this.mechanics.update((list) =>
            list.map((m) => (String(m.id) === String(id) ? updatedMechanic : m)),
          );
          resolve();
        },
        error: (err) => {
          this.error.set('mechanics.errors.updateError');
          reject(err);
        },
      });
    });
  }

  deleteMechanic(id: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.deleteMechanic(id).subscribe({
        next: () => {
          this.mechanics.update((list) => list.filter((m) => String(m.id) !== String(id)));
          resolve();
        },
        error: (err) => {
          this.error.set('mechanics.errors.deleteError');
          reject(err);
        },
      });
    });
  }
}
