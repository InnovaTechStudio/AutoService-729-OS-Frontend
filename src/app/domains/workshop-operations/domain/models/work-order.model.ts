/**
 * Domain models for Work Orders and Tasks.
 * 
 * Contains the main interfaces related to the workflow
 * in the mechanical workshop.
 * 
 * @module WorkOrder Models
 */

/**
 * Represents a Work Order in the workshop.
 * 
 * It is the main document that records the entry of a vehicle
 * and groups all associated tasks.
 * 
 * @interface
 * @model
 */
export interface WorkOrder {
  /** Unique ID of the work order */
  id?: string;

  /** ID of the workshop to which it belongs */
  workshopId?: string;

  /** Unique tracking code */
  trackingCode?: string;

  /** ID of the vehicle to which the order corresponds */
  vehicleId: string;

  /** ID of the owner customer */
  customerId: string;

  /** Detailed description of the problem reported or work requested */
  description: string;

  /** Current status of the order */
  status: 'En Proceso' | 'Finalizado';

  /** Start date of the order */
  startDate: string;

  /** Estimated completion date */
  estimatedDate: string;

  /** Total estimated or agreed price */
  price: number;
}

/**
 * Represents an individual Task within a Work Order.
 * 
 * @interface
 * @model
 */
export interface Task {
  /** Unique ID of the task */
  id?: string;
  
  /** ID of the workshop */
  workshopId?: string;

  /** ID of the work order to which this task belongs */
  workOrderId: string;

  /** Detailed description of the task */
  description: string;

  /** Current status of the task */
  status: 'Pendiente' | 'En Proceso' | 'Completada';

  /** ID of the mechanic assigned to the task */
  mechanicId: string;

  /** Priority level of the task */
  priority?: 'Baja' | 'Media' | 'Alta' | 'Crítica';

  /** Estimated time in hours */
  estimatedTime?: number;
}
