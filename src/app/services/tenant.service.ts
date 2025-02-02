import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from '@angular/fire/firestore';
import { ITenant } from '../interface/tenant';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  constructor(private firestore: Firestore) {}

  async createTenant(
    userId: string,
    tenantData: Partial<ITenant>
  ): Promise<string> {
    const tenantsRef = collection(this.firestore, `users/${userId}/tenants`);
    const newTenantRef = doc(tenantsRef); // Firebase generará un ID único automáticamente

    const tenant: ITenant = {
      firebaseId: newTenantRef.id,
      name: tenantData.name || '',
      initialReading: tenantData.initialReading || 0,
      createdAt: new Date(),
      active: true, // Nuevo campo para controlar si el tenant está activo
      initialEmissionDate: tenantData.initialEmissionDate || new Date(),
    };

    await setDoc(newTenantRef, tenant);
    return newTenantRef.id;
  }

  async updateTenant(
    userId: string,
    tenantId: string,
    data: Partial<ITenant>
  ): Promise<void> {
    const tenantRef = doc(
      this.firestore,
      `users/${userId}/tenants/${tenantId}`
    );
    await updateDoc(tenantRef, { ...data, updatedAt: new Date() });
  }

  async deactivateTenant(userId: string, tenantId: string): Promise<void> {
    const tenantRef = doc(
      this.firestore,
      `users/${userId}/tenants/${tenantId}`
    );
    await updateDoc(tenantRef, {
      active: false,
      deactivatedAt: new Date(),
    });
  }

  async getTenants(
    userId: string,
    activeOnly: boolean = true
  ): Promise<ITenant[]> {
    const tenantsRef = collection(this.firestore, `users/${userId}/tenants`);
    const snapshot = await getDocs(tenantsRef);

    return snapshot.docs
      .map(
        (doc) =>
          ({
            firebaseId: doc.id,
            ...doc.data(),
          } as ITenant)
      )
      .filter((tenant) => !activeOnly || tenant.active);
  }
}
