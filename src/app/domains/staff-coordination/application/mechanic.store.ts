import { Injectable, inject, signal } from '@angular/core';
import { MechanicService } from '../infrastructure/services/mechanic.service';
import { Mechanic } from '../domain/models/mechanic.model';

@Injectable({ providedIn: 'root' })
export class MechanicStore {
  private mechanicService = inject(MechanicService);

  readonly mechanics = signal<Mechanic[]>([]);
  readonly isLoading = signal<boolean>(false);

  loadMechanics() {
    this.isLoading.set(true);
    this.mechanicService.getAll().subscribe({
      next: (data) => { this.mechanics.set(data); this.isLoading.set(false); },
      error: (err) => { console.error('Error cargando mecánicos:', err); this.isLoading.set(false); }
    });
  }

  addMechanic(mechanic: Mechanic) {
    this.mechanicService.create(mechanic).subscribe({
      next: (newMechanic) => this.mechanics.update(list => [...list, newMechanic]),
      error: (err) => console.error('Error creando mecánico:', err)
    });
  }
}
