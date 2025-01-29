import { Injectable, signal } from '@angular/core';
import { FirestoreTenant, ITenant } from '@app/interface/tenant';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  tenants = signal<ITenant[]>([]);

  mainData = signal<FirestoreTenant>({} as FirestoreTenant);

  constructor() {}
}
