/**
 * MechanicStore
 * 
 * Reactive store based on Signals that manages the status of mechanics
 * from the workshop. It acts as an intermediate layer between the components and the
 * MechanicService.
 * 
 * It provides methods for loading, adding, updating, and deleting mechanics.
 * with automatic UI updates thanks to Signals.
 * 
 * @service
 * @providedIn 'root'
 */

import { Injectable, inject, signal } from '@angular/core';
import { MechanicService } from '../infrastructure/services/mechanic.service';
import { Mechanic } from '../domain/models/mechanic.model';

@Injectable({ providedIn: 'root' })
export class MechanicStore {
  private readonly service = inject(MechanicService);

  /** Reactive list of all mechanics */
  readonly mechanics = signal<Mechanic[]>([]);

  /** Indicates if mechanic information is being loaded */
  readonly isLoading = signal<boolean>(false);

  /**
   * Load all mechanics from the backend.
   */
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

  /**
   * Registers a new mechanic and adds them to the local list.
   * 
   * @param mechanic - Data of the mechanic to register
   */
  addMechanic(mechanic: Mechanic): void {
    this.service.createMechanic(mechanic).subscribe({
      next: (newMechanic) => {
        this.mechanics.update((list) => [...list, newMechanic]);
      },
      error: (err) => console.error('Error registrando mecánico:', err)
    });
  }

  /**
   * Updates the information of an existing mechanic.
   * 
   * @param id - ID of the mechanic to update
   * @param mechanic - Updated data of the mechanic
   */
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

  /**
   * Deletes a mechanic from the system and updates the local list.
   * 
   * @param id - ID of the mechanic to delete
   */
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
