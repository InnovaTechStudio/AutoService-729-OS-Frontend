export interface InventoryItem {
  id?: string | number;
  sku?: string;
  name: string;
  category: string;
  brand: string;
  unitPrice: number;
  stock: number;
  minStock: number;
  image?: string;
}
