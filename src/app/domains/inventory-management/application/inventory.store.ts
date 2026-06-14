import { Injectable, inject, signal } from '@angular/core';
import { InventoryService } from '../infrastructure/services/inventory.service';
import { InventoryItem } from '../domain/models/inventory-item.model';

@Injectable({ providedIn: 'root' })
export class InventoryStore {
  private service = inject(InventoryService);

  readonly items = signal<InventoryItem[]>([]);
  readonly loading = signal<boolean>(false);

  loadItems(): Promise<void> {
    this.loading.set(true);
    return new Promise((resolve, reject) => {
      this.service.getAll().subscribe({
        next: (data) => {
          this.items.set(data.map((item) => this.normalizeItem(item)));
          this.loading.set(false);
          resolve();
        },
        error: (err) => {
          console.error('Error cargando inventario:', err);
          this.loading.set(false);
          reject(err);
        },
      });
    });
  }

  addItem(itemData: InventoryItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const newItem = this.normalizeItem(itemData);
      this.service.create(newItem).subscribe({
        next: (response) => {
          this.items.update((list) => [...list, this.normalizeItem(response)]);
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  updateItem(id: string | number, itemData: InventoryItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = this.normalizeItem(itemData);
      this.service.update(id, payload).subscribe({
        next: (response) => {
          this.items.update((list) =>
            list.map((i) => (String(i.id) === String(id) ? this.normalizeItem(response) : i)),
          );
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  deleteItem(id: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.delete(id).subscribe({
        next: () => {
          this.items.update((list) => list.filter((i) => String(i.id) !== String(id)));
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  private normalizeItem(data: any): InventoryItem {
    return {
      id: data.id || null,
      sku: data.sku || null,
      name: data.name || '',
      category: data.category || 'SPARE_PART',
      brand: data.brand || 'GENERIC',
      unitPrice: parseFloat(data.unitPrice) || 0.0,
      stock: parseInt(data.stock) || 0,
      minStock: parseInt(data.minStock) || 5,
      image: data.image || data.Image || '',
    };
  }
}
