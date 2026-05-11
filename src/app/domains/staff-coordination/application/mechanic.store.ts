import { Injectable, inject, signal } from '@angular/core';
import { MechanicService } from '../infrastructure/services/mechanic.service';
import { Mechanic } from '../domain/models/mechanic.model';

@Injectable({ providedIn: 'root' })
export class MechanicStore {
  private readonly service = inject(MechanicService);

  readonly mechanics = signal<Mechanic[]>([]);
  readonly isLoading = signal<boolean>(false);

  loadMechanics(): void {
    this.isLoading.set(true);

    this.service.getMechanics().subscribe({
      next: (data) => {
        this.mechanics.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando mecánicos:', err);
        this.isLoading.set(false);
      }
    });
  }

  addMechanic(mechanic: Mechanic): void {
    this.service.createMechanic(mechanic).subscribe({
      next: (newMechanic) => {
        this.mechanics.update((list) => [...list, newMechanic]);
      },
      error: (err) => console.error('Error registrando mecánico:', err)
    });
  }

  updateMechanic(id: string, mechanic: Mechanic): void {
    this.service.updateMechanic(id, mechanic).subscribe({
      next: (updatedMechanic) => {
        this.mechanics.update((list) =>
          list.map((item) =>
            String(item.id) === String(id) ? updatedMechanic : item
          )
        );
      },
      error: (err) => console.error('Error actualizando mecánico:', err)
    });
  }

  deleteMechanic(id: string): void {
    this.service.deleteMechanic(id).subscribe({
      next: () => {
        this.mechanics.update((list) =>
          list.filter((item) => String(item.id) !== String(id))
        );
      },
      error: (err) => console.error('Error eliminando mecánico:', err)
    });
  }
}
