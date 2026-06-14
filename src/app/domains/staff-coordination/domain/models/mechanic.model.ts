export interface Mechanic {
  id?: string | number;
  fullName: string;
  specialty: string;
  maxCapacity: number;
  email?: string;
  password?: string;
  username?: string;
  currentLoad?: number;
}
