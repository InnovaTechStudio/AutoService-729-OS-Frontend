export interface User {
  id: number;
  email: string;
  role: string;
  workshopId?: number;
  mechanicId?: number;
  name?: string;
}

export interface AuthResponse extends User {
  token: string;
}
