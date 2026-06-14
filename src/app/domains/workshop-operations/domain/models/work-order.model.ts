export interface WorkOrder {
  id?: string | number;
  trackingCode?: string;
  status: string; // 'PENDING', 'IN_PROGRESS', 'FINISHED', 'DELIVERED', 'CANCELLED'
  startDate: string | Date;
  estimatedDate?: string | Date;
  price: number;
  vehicleId: string | number;
  workshopId?: string | number;
  customerId?: string | number;
  mechanicId?: number | string;
  description?: string;
  tasksCompleted?: boolean;
  sparePartsChecked?: boolean;
  diagnosisValidated?: boolean;
  cleaningDone?: boolean;
  finalTestDone?: boolean;
}
