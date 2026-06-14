export interface Task {
  id?: string | number;
  description: string;
  status: string; // 'PENDING', 'IN_PROGRESS', 'COMPLETED'
  priority: string; // 'LOW', 'MEDIUM', 'HIGH'
  estimatedTime: number;
  laborPrice: number;
  customerExplanation?: string;
  adminReviewStatus?: string; // 'PENDING', 'APPROVED', 'REJECTED'
  workOrderId: string | number;
  mechanicId?: string | number | null;
  parts?: any[];
}
