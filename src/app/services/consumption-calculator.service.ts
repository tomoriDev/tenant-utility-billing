import { Injectable } from '@angular/core';
import { TenantReading } from '../interface/tenant';
import { differenceInDays } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class ConsumptionCalculatorService {
  calculateConsumptionMetrics(
    previousReadingDate: Date | any, // Puede ser Timestamp
    currentReading: number,
    previousReading: number,
    readingDate: Date | any, // Puede ser Timestamp
    pricePerKwh: number
  ): Partial<TenantReading> {
    const prevDate = previousReadingDate?.toDate
      ? previousReadingDate.toDate()
      : new Date(previousReadingDate);

    const currDate = readingDate?.toDate
      ? readingDate.toDate()
      : new Date(readingDate);

    // Calcular días entre lecturas
    const daysInPeriod = differenceInDays(currDate, prevDate) + 1;

    const consumption = currentReading - previousReading;
    const dailyConsumption = +(consumption / daysInPeriod).toFixed(2);

    return {
      consumption,
      dailyConsumption,
      daysInPeriod,
      amount: +(consumption * pricePerKwh).toFixed(2),
    };
  }
}
