import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
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
export class BillingHttpService {
  constructor(private firestore: Firestore) {}

  async setMonthlyBilling(
    userId: string,
    year: string,
    month: string,
    data: MonthlyBill
  ): Promise<void> {
    // Ensure year document exists
    const yearRef = doc(this.firestore, `users/${userId}/billing/${year}`);
    await setDoc(yearRef, {}, { merge: true });

    // Set month data
    const monthRef = doc(yearRef, `months/${month}`);
    await setDoc(
      monthRef,
      {
        totalAmount: data.totalAmount,
        totalKwh: data.totalKwh,
      },
      { merge: true }
    );

    if (data.readings) {
      const readingsCollection = collection(monthRef, 'readings');
      await Promise.all(
        Object.entries(data.readings).map(([tenantId, reading]) =>
          setDoc(doc(readingsCollection, tenantId), reading, { merge: true })
        )
      );
    }
  }
}
