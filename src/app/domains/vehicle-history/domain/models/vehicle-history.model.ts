export interface VehicleHistory {
  id?: string;
  vehicleId: string;
  plate: string;
  customerId: string;
  workshopId: string;
  workshopName: string;
  workOrderId: string;
  trackingCode: string;
  serviceDate: string;
  serviceTitle: string;
  mechanicName: string;
  technicalSummary: string;
  customerSummary: string;
  tasksCompleted: string[];
  recommendation: string;
  evidenceRegistered: boolean;
  createdFromAdminValidation: boolean;
}
