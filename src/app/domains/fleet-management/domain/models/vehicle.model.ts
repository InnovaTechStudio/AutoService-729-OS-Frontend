export interface Vehicle {
  id?: string | number;
  plate: string;
  brand: string;
  model: string;
  year: string | number;
  color: string;
  status: string;
  customerId: string | number | null;
  image?: string;
  imageFile?: File | null;
}
