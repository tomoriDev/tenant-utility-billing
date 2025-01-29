export interface ITenant {
  firebaseId: string;
  name: string;
  lastComsumption: number;
  createdAt: Date;
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
  readings: {
    [tenantId: string]: TenantReading;
  };
}

export interface TenantReading {
  previousReading: number;
  currentReading: number;
  consumption: number;
  readingDate: Date;
}
