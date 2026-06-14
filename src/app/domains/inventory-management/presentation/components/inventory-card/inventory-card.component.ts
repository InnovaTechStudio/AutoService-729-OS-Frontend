import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InventoryItem } from '../../../domain/models/inventory-item.model';

@Component({
  selector: 'app-inventory-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslatePipe],
  templateUrl: './inventory-card.component.html',
  styleUrl: './inventory-card.component.css',
})
export class InventoryCardComponent {
  @Input({ required: true }) item!: InventoryItem;
  @Output() edit = new EventEmitter<InventoryItem>();

  public translate = inject(TranslateService);

  getCategoryLabel(categoryValue: string): string {
    const key = String(categoryValue).toLowerCase();
    return this.translate.instant(`inventory.categories.${key}`);
  }

  getStockSeverityClass(item: InventoryItem): string {
    if (item.stock === 0) return 'badge-danger';
    if (item.stock <= item.minStock) return 'badge-warning';
    return 'badge-success';
  }

  getStockLabel(item: InventoryItem): string {
    if (item.stock === 0) return this.translate.instant('inventory.status.outOfStock') || 'Agotado';
    if (item.stock <= item.minStock)
      return this.translate.instant('inventory.status.lowStock') || 'Poco Stock';
    return this.translate.instant('inventory.status.inStock') || 'En Stock';
  }
}
