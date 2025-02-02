import { Injectable, signal, WritableSignal } from '@angular/core';
import { FirestoreTenant, ITenant } from '@app/interface/tenant';

interface DataState<T> {
  status: DataStatus;
  data: T | null;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private initialState = {
    status: DataStatus.INITIAL,
    data: null,
  };

  tenants = signal<DataState<ITenant[]>>(this.initialState);

  mainData = signal<DataState<FirestoreTenant>>(this.initialState);

  setLoading<T>(signal: WritableSignal<DataState<T>>) {
    signal.set({ status: DataStatus.LOADING, data: null });
  }

  setSuccess<T>(signal: WritableSignal<DataState<T>>, data: T) {
    signal.set({ status: DataStatus.SUCCESS, data });
  }

  setError<T>(signal: WritableSignal<DataState<T>>, error: string) {
    signal.set({ status: DataStatus.ERROR, data: null, error });
  }

  setDataSource<T>(signal: WritableSignal<DataState<T>>, data: T) {
    signal.set({ status: DataStatus.SUCCESS, data });
  }
}

export enum DataStatus {
  INITIAL = 'INITIAL',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  EMPTY = 'EMPTY',
}
