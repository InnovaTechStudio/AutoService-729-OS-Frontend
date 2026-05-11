export interface Mechanic {
  id?: string;
  fullName: string;
  specialty: string;
  phone?: string;
  status?: 'Disponible' | 'Ocupado';
  maxCapacity?: number;
}
