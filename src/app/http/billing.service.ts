import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { MonthlyBill } from '../interface/tenant';

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
    const yearRef = doc(this.firestore, `users/${userId}/billing/${year}`);
    await setDoc(yearRef, {}, { merge: true });

    const monthRef = doc(yearRef, `months/${month}`);
    await setDoc(
      monthRef,
      {
        totalAmount: data.totalAmount,
        totalKwh: data.totalKwh,
        priceKwh: data.priceKwh,
        timestamp: new Date(),
      },
      { merge: true }
    );

    if (data.readings && Array.isArray(data.readings)) {
      const readingsCollection = collection(monthRef, 'readings');
      await Promise.all(
        data.readings.map((reading) =>
          setDoc(doc(readingsCollection, reading.id), reading, { merge: true })
        )
      );
    }
  }
}
