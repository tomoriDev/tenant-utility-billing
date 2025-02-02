export interface ITenant {
  firebaseId: string;
  name: string;
  initialReading: number;
  createdAt: Date;
  active: boolean;
  initialEmissionDate: Date;
  deactivatedAt?: Date;
  updatedAt?: Date;
}

export interface FirestoreTenant {
  id: string;
  name: string;
  initialEmissionDate: number;
  createdAt: Date;
  billing?: {
    [year: string]: YearlyBilling;
  };
}

export interface YearlyBilling {
  [month: string]: MonthlyBill;
}

export interface MonthlyBill {
  totalAmount: number;
  totalKwh: number;
  timestamp: Date;
  priceKwh: number;
  month?: string;  // Agregar para referencia
  year?: string;   // Agregar para referencia
  readings: TenantReading[];
}

export interface TenantReading {
  tenantId: string;
  name: string;
  currentReading: number;
  previousReading: number;  // Agregar para referencia histórica
  consumption: number;
  amount: number;
  readingDate: Date;
}
