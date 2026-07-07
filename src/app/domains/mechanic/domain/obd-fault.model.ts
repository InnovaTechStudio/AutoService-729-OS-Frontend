export type ObdSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ObdFault {
  code: string;
  title: string;
  description: string;
  severity: ObdSeverity;
  suggestedEstimatedTime: number;
  suggestedLaborPrice: number;
}

export interface ObdScanResult {
  vin: string;
  scannedAt: Date;
  faults: ObdFault[];
}
