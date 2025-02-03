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

  private toUTCDate(value: any): Date {
    // Igual que en los demás sitios
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return new Date(Date.UTC(1970, 0, 1));
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
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
          reading.tenantId = readingDoc.id;
          // No convertir a Date: conservarlo como Timestamp
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
    const billings = await this.getAllBillings(userId);
    
    // Ordenar años de más reciente a más antiguo
    const years = Object.keys(billings).sort((a, b) => parseInt(b) - parseInt(a));
    
    if (years.length > 0) {
      const lastYear = years[0];
      const months = Object.keys(billings[lastYear]).sort((a, b) => parseInt(b) - parseInt(a));
      
      if (months.length > 0) {
        const lastMonth = months[0];
        const lastMonthData = billings[lastYear][lastMonth];
        
        console.log('Last month data:', {
          year: lastYear,
          month: lastMonth,
          readings: lastMonthData.readings
        });

        // Usar las lecturas del último mes registrado
        lastMonthData.readings.forEach(reading => {
          lastReadings.set(reading.tenantId, reading.currentReading);
        });
      }
    }

    // Si no hay lecturas previas, usar las lecturas iniciales de los tenants
    if (lastReadings.size === 0) {
      const tenants = await this.getTenants(userId);
      tenants.forEach(tenant => {
        lastReadings.set(tenant.firebaseId, tenant.initialReading);
      });
    }

    console.log('Final readings:', {
      mappedReadings: Object.fromEntries(lastReadings),
      fromBillings: years.length > 0
    });

    return lastReadings;
  }
}
