import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
} from '@angular/fire/firestore';
import {
  ITenant,
  MonthlyBill,
  TenantReading,
  YearlyBilling,
} from '../interface/tenant';

@Injectable({
  providedIn: 'root',
})
export class UserHttpService {
  constructor(private firestore: Firestore) {}

  async getUserData(userId: string): Promise<any> {
    const [userSnap, tenants, billings] = await Promise.all([
      getDoc(doc(this.firestore, `users/${userId}`)),
      this.getTenants(userId),
      this.getAllBillings(userId),
    ]);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    return {
      id: userSnap.id,
      ...userSnap.data(),
      tenants,
      billing: billings,
    } as any;
  }

  private async getYearlyBilling(
    userId: string,
    year: string
  ): Promise<YearlyBilling> {
    const monthsRef = collection(
      this.firestore,
      `users/${userId}/billing/${year}/months`
    );

    const monthsSnap = await getDocs(monthsRef);
    const yearlyData: YearlyBilling = {};

    await Promise.all(
      monthsSnap.docs.map(async (monthDoc) => {
        const readingsRef = collection(monthDoc.ref, 'readings');
        const readingsSnap = await getDocs(readingsRef);
        const readings: TenantReading[] = [];
        readingsSnap.forEach((readingDoc) => {
          const reading = readingDoc.data() as TenantReading;
          reading.tenantId = readingDoc.id
          readings.push(reading);
        });

        yearlyData[monthDoc.id] = {
          ...monthDoc.data(),
          readings,
        } as MonthlyBill;
      })
    );

    return yearlyData;
  }

  async getAllBillings(
    userId: string
  ): Promise<{ [year: string]: YearlyBilling }> {
    const billingRef = collection(this.firestore, `users/${userId}/billing`);
    const yearsSnap = await getDocs(billingRef);
    const allBillings: { [year: string]: YearlyBilling } = {};

    await Promise.all(
      yearsSnap.docs.map(async (yearDoc) => {
        const yearData = await this.getYearlyBilling(userId, yearDoc.id);
        allBillings[yearDoc.id] = yearData;
      })
    );

    return allBillings;
  }

  private async getTenants(userId: string): Promise<ITenant[]> {
    const tenantsRef = collection(this.firestore, `users/${userId}/tenants`);

    const tenantsSnap = await getDocs(tenantsRef);

    return tenantsSnap.docs.map(
      (doc) =>
        ({
          firebaseId: doc.id,
          ...doc.data(),
        } as ITenant)
    );
  }

  async getLastReadings(userId: string): Promise<Map<string, number>> {
    const lastReadings = new Map<string, number>();
    
    // Primero obtener todos los tenants para tener las lecturas iniciales
    const tenants = await this.getTenants(userId);
    tenants.forEach(tenant => {
      lastReadings.set(tenant.firebaseId, tenant.initialReading);
    });

    // Luego buscar en el historial de lecturas por si hay más recientes
    const billings = await this.getAllBillings(userId);
    const years = Object.keys(billings).sort((a, b) => parseInt(b) - parseInt(a));

    for (const year of years) {
      const months = Object.keys(billings[year]).sort((a, b) => parseInt(b) - parseInt(a));
      for (const month of months) {
        const readings = billings[year][month].readings;
        for (const reading of readings) {
          // Actualizar solo si encontramos una lectura más reciente
          lastReadings.set(reading.tenantId, reading.currentReading);
          // Una vez que encontramos la primera lectura para un tenant, será la más reciente
          // debido al orden descendente de años y meses
        }
      }
    }

    console.log('Final readings with fallback:', Object.fromEntries(lastReadings));
    return lastReadings;
  }
}
