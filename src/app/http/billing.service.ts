import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { MonthlyBill } from '../interface/tenant';
import { Timestamp } from 'firebase/firestore';

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
    try {
      const yearRef = doc(this.firestore, `users/${userId}/billing/${year}`);
      await setDoc(yearRef, {}, { merge: true });

      const monthRef = doc(yearRef, `months/${month}`);
      
      // Guardar los datos principales del mes
      await setDoc(
        monthRef,
        {
          totalAmount: Number(data.totalAmount),
          totalKwh: Number(data.totalKwh),
          priceKwh: Number(data.priceKwh),
          month: month,
          year: year
        },
        { merge: true }
      );

      // Guardar las lecturas individuales
      if (data.readings && Array.isArray(data.readings)) {
        const readingsCollection = collection(monthRef, 'readings');
        await Promise.all(
          data.readings.map((reading) =>
            setDoc(doc(readingsCollection, reading.tenantId), {
              ...reading,
              currentReading: Number(reading.currentReading),
              previousReading: Number(reading.previousReading),
              consumption: Number(reading.consumption),
              amount: Number(reading.amount),
              readingDate: Timestamp.fromDate(
                reading.readingDate instanceof Date
                  ? reading.readingDate
                  : new Date()
              ),
              previousReadingDate: Timestamp.fromDate(
                reading.previousReadingDate instanceof Date
                  ? reading.previousReadingDate
                  : new Date()
              ),
              isFirstReading: reading.isFirstReading || false
            })
          )
        );
      }
    } catch (error) {
      console.error('Error saving monthly billing:', error);
      throw error;
    }
  }
}
