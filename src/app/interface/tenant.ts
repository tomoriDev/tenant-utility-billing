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
  priceKwh: number;
  month?: string;  // Agregar para referencia
  year?: string;   // Agregar para referencia
  readings: TenantReading[];
  expectedReadingDay?: number;    // Nuevo: día esperado para la lectura
  hasIrregularReadings?: boolean; // Nuevo: indicador de lecturas fuera de fecha
}

export interface TenantReading {
  tenantId: string;
  name: string;
  currentReading: number;
  previousReading: number;
  consumption: number;
  amount: number;
  readingDate: Date;         // Fecha actual de lectura
  previousReadingDate: Date; // Fecha de la lectura anterior o initialEmissionDate
  daysInPeriod: number;
  dailyConsumption: number;
  isFirstReading: boolean;   // Para saber si es la primera lectura del tenant
}

export interface MonthYear {
  month: string;
  year: string;
  isRegistered?: boolean;
}
