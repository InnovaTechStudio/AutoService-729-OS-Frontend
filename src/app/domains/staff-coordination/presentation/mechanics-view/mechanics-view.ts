import { Component, computed, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { MechanicStore } from '../../application/mechanic.store';
import { AuthState } from '../../../auth/application/auth.state';
import { Mechanic } from '../../domain/models/mechanic.model';
import { MechanicFiltersComponent } from './components/mechanic-filters/mechanic-filters';
import { MechanicCardComponent } from './components/mechanic-card/mechanic-card';

@Component({
  selector: 'app-mechanics-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MechanicFiltersComponent,
    MechanicCardComponent,
    TranslatePipe,
  ],
  templateUrl: './mechanics-view.html',
  styleUrl: './mechanics-view.css',
})
export class MechanicsViewComponent implements OnInit {
  mechanicStore = inject(MechanicStore);
  authState = inject(AuthState);
  private dialog = inject(MatDialog);
  public translate = inject(TranslateService);

  @ViewChild('mechanicDialog') mechanicDialogTemplate!: TemplateRef<any>;

  mechanicForm = signal<Mechanic>(this.getEmptyMechanic());
  search = signal('');
  selectedSpecialty = signal<string | null>(null);

  specialtyOptions = computed(() => [
    this.translate.instant('mechanics.specialties.general'),
    this.translate.instant('mechanics.specialties.electrical'),
    this.translate.instant('mechanics.specialties.brakes'),
    this.translate.instant('mechanics.specialties.tires'),
  ]);

  adminDomain = computed(() => {
    const email = this.authState.currentUser()?.email;
    if (!email) return '@taller.com';
    return `@${email.split('@')[1]}`;
  });

  filteredMechanics = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.mechanicStore.mechanics().filter((m) => {
      const matchesSearch =
        !term || m.fullName?.toLowerCase().includes(term) || m.email?.toLowerCase().includes(term);
      const matchesSpecialty =
        !this.selectedSpecialty() || m.specialty === this.selectedSpecialty();
      return matchesSearch && matchesSpecialty;
    });
  });

  ngOnInit() {
    this.mechanicStore.loadMechanics();
  }

  openNew() {
    this.mechanicForm.set(this.getEmptyMechanic());
    this.mechanicStore.error.set(null);
    this.dialog.open(this.mechanicDialogTemplate, {
      width: '450px',
      panelClass: 'custom-dialog-container',
    });
  }

  openEdit(mech: Mechanic) {
    this.mechanicForm.set({ ...mech });
    this.mechanicStore.error.set(null);
    this.dialog.open(this.mechanicDialogTemplate, {
      width: '450px',
      panelClass: 'custom-dialog-container',
    });
  }

  hideDialog() {
    this.dialog.closeAll();
    this.mechanicStore.error.set(null);
  }

  async confirmDelete(mech: Mechanic) {
    const confirmed = window.confirm(
      this.translate.instant('mechanics.confirm.delete', { name: mech.fullName }),
    );
    if (!confirmed || !mech.id) return;
    await this.mechanicStore.deleteMechanic(mech.id);
  }

  async saveMechanic() {
    this.mechanicStore.error.set(null);
    try {
      const mech = this.mechanicForm();
      if (mech.id) {
        await this.mechanicStore.updateMechanic(mech.id, mech);
        this.hideDialog();
        return;
      }

      const hasRequiredFields = mech.fullName && mech.username && mech.password;
      if (!hasRequiredFields) return;

      const fullEmail = `${mech.username!.trim()}${this.adminDomain()}`;
      const payload: Mechanic = {
        fullName: mech.fullName,
        specialty: mech.specialty,
        maxCapacity: mech.maxCapacity,
        email: fullEmail,
        password: mech.password,
      };

      await this.mechanicStore.addMechanic(payload);
      this.hideDialog();
    } catch (error: any) {
      if (error?.status === 400) {
        this.mechanicStore.error.set(this.translate.instant('mechanics.errors.invalidData'));
      } else {
        this.mechanicStore.error.set(this.translate.instant('mechanics.errors.server'));
      }
    }
  }

  private getEmptyMechanic(): Mechanic {
    return { fullName: '', specialty: '', maxCapacity: 3, username: '', password: '' };
  }
}
