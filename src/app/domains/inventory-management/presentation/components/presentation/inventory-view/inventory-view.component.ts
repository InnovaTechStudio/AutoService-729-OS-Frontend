import { Component, computed, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { InventoryStore } from '../../../../application/inventory.store';
import { InventoryItem } from '../../../../domain/models/inventory-item.model';
import { InventoryCardComponent } from '../../inventory-card/inventory-card.component';

const INVENTORY_CATEGORIES = {
  SPARE_PART: 'SPARE_PART',
  OIL: 'OIL',
  SUPPLY: 'SUPPLY',
  TOOL: 'TOOL',
};

@Component({
  selector: 'app-inventory-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    TranslatePipe,
    InventoryCardComponent,
  ],
  templateUrl: './inventory-view.component.html',
  styleUrl: './inventory-view.component.css',
})
export class InventoryViewComponent implements OnInit {
  public inventoryStore = inject(InventoryStore);
  private dialog = inject(MatDialog);
  public translate = inject(TranslateService);

  @ViewChild('inventoryDialog') inventoryDialogTemplate!: TemplateRef<any>;

  search = signal('');
  itemForm = signal<InventoryItem>(this.getEmptyItem());

  categories = computed(() => [
    {
      value: INVENTORY_CATEGORIES.SPARE_PART,
      label: this.translate.instant('inventory.categories.spare_part'),
    },
    { value: INVENTORY_CATEGORIES.OIL, label: this.translate.instant('inventory.categories.oil') },
    {
      value: INVENTORY_CATEGORIES.SUPPLY,
      label: this.translate.instant('inventory.categories.supply'),
    },
    {
      value: INVENTORY_CATEGORIES.TOOL,
      label: this.translate.instant('inventory.categories.tool'),
    },
  ]);

  filteredItems = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.inventoryStore
      .items()
      .filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.sku && item.sku.toLowerCase().includes(term)),
      );
  });

  ngOnInit() {
    this.inventoryStore.loadItems();
  }

  openNew() {
    this.itemForm.set(this.getEmptyItem());
    this.dialog.open(this.inventoryDialogTemplate, {
      width: '450px',
      panelClass: 'custom-dialog-container',
    });
  }

  editItem(item: InventoryItem) {
    this.itemForm.set({ ...item });
    this.dialog.open(this.inventoryDialogTemplate, {
      width: '450px',
      panelClass: 'custom-dialog-container',
    });
  }

  async saveItem() {
    const currentItem = this.itemForm();
    if (!currentItem.name) return;

    if (currentItem.id) {
      await this.inventoryStore.updateItem(currentItem.id, currentItem);
    } else {
      await this.inventoryStore.addItem(currentItem);
    }
    this.dialog.closeAll();
  }

  async deleteItem() {
    const currentItem = this.itemForm();
    if (confirm(this.translate.instant('inventory.deleteConfirm', { name: currentItem.name }))) {
      if (currentItem.id) {
        await this.inventoryStore.deleteItem(currentItem.id);
        this.dialog.closeAll();
      }
    }
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.itemForm.update((item) => ({ ...item, image: e.target.result }));
    };
    reader.readAsDataURL(file);
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  private getEmptyItem(): InventoryItem {
    return {
      name: '',
      category: INVENTORY_CATEGORIES.SPARE_PART,
      brand: '',
      unitPrice: 0,
      stock: 10,
      minStock: 3,
      image: '',
    };
  }
}
