import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  tenants = signal({
    emissionDate: '2025-01-01T05:00:00.000Z',
    tenants: [
      {
        name: 'CARLOS',
        lastReading: 1234,
      },
      {
        name: 'MARIA',
        lastReading: 123849,
      },
    ],
  });

  constructor() {}
}
