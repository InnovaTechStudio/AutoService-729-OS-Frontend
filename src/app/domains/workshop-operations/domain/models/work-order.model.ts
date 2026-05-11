export interface WorkOrder {
  id?: string;
  workshopId?: string;
  trackingCode?: string;
  vehicleId: string;
  customerId: string;
  description: string;
  status: 'En Proceso' | 'Finalizado';
  startDate: string;
  estimatedDate: string;
  price: number;
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
}
