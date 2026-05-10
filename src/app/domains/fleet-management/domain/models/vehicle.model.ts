export interface Vehicle {
  id?: string;
  workshopId?: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  status: 'En Taller' | 'Listo' | 'Entregado';
  customerId: string;
}
