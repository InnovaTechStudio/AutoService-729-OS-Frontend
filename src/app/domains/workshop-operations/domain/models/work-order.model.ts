export interface WorkOrder {
  id?: string;
  trackingCode?: string;
  vehicleId: string;
  customerId: string;
  description: string;
  startDate: string;
  estimatedDate: string;
  status: 'Pendiente' | 'En Proceso' | 'Finalizado' | 'Cancelado';
  price?: number;
}

export interface Task {
  id?: string;
  workshopId?: string;
  workOrderId: string;
  description: string;
  status: 'Pendiente' | 'En Proceso' | 'Completada';
  mechanicId: string;
  priority?: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  estimatedTime?: number;
  photo?: string;
}
