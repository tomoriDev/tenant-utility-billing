import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterFormComponent } from './register-form/register-form.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { DataService, DataStatus } from '@app/services/data.service';
import { CommonModule } from '@angular/common';
import { RegisterMonthComponent } from './register-month/register-month.component';
import { UserHttpService } from '@app/http/user.service';
import { BillingHttpService } from '@app/http/billing.service';
import { MonthDetailComponent } from '@app/components/month-detail/month-detail.component';
import { TenantService } from '@app/services/tenant.service';
import { MonthYearPipe } from '@app/pipes/month-year.pipe';
import { BehaviorSubject } from 'rxjs';
import { MonthlyBill, MonthYear } from '@app/interface/tenant';

@Component({
  selector: 'app-main',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatExpansionModule,
    MonthDetailComponent,
    MonthYearPipe
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class MainComponent implements OnInit {
  formData?: any;

  currentYear = new Date().getFullYear();
  currentMonth = ('0' + (new Date().getMonth() + 1)).slice(-2); // Formato "01", "02", etc.

  // Array de meses disponibles (podrías generarlo dinámicamente basado en el año)
  months = Array.from({ length: 12 }, (_, i) => ('0' + (i + 1)).slice(-2));

  DataStatus = DataStatus;

  lastReadings = new Map<string, number>();

  nextAvailableMonth$ = new BehaviorSubject<MonthYear | null>(null);

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    public billingHttp: BillingHttpService,
    public userHttp: UserHttpService,
    private tenantService: TenantService
  ) {}

  async ngOnInit(): Promise<void> {
    // this.openModal();
    await this.getUserData();
    this.updateNextAvailableMonth();
  }

  async getUserData(): Promise<void> {
    this.dataService.setLoading(this.dataService.mainData);
    try {
      const userData = await this.userHttp.getUserData('123');
      this.dataService.setSuccess(this.dataService.mainData, userData);
      this.dataService.setDataSource(this.dataService.mainData, userData);
      console.log(this.dataService.mainData().data);
    } catch (error) {
      this.dataService.setError(this.dataService.mainData, error as never);
    }
  }

  private openModal(): void {
    const dialogRef = this.dialog.open(RegisterFormComponent, {
      width: '500px',
      disableClose: true,
      position: { top: '20px' },
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        try {
          // Registrar cada tenant
          const promises = result.tenants.map((tenant: any) => 
            this.tenantService.createTenant('123', {
              name: tenant.name,
              initialReading: tenant.lastReading,
              initialEmissionDate: result.emissionDate
            })
          );

          await Promise.all(promises);
          
          // Actualizar los datos
          await this.getUserData();
        } catch (error) {
          console.error('Error registering tenants:', error);
          // Aquí podrías mostrar un mensaje de error
        }
      }
    });
  }

  // Método para verificar si un mes ya tiene lecturas registradas
  async isMonthRegistered(year: string, month: string): Promise<boolean> {
    const billings = this.dataService.mainData().data?.billing || {};
    return billings[year]?.hasOwnProperty(month) || false;
  }

  // Método para obtener el siguiente mes disponible
  async getNextAvailableMonth(): Promise<{ month: string, year: string }> {
    let year = this.currentYear.toString();
    let month = this.currentMonth;

    // Verificar si el mes actual ya está registrado
    if (await this.isMonthRegistered(year, month)) {
      // Buscar el siguiente mes disponible
      for (let i = 0; i < 12; i++) {
        month = ('0' + ((parseInt(month) % 12) + 1)).slice(-2);
        if (month === '01') {
          year = (parseInt(year) + 1).toString();
        }
        if (!(await this.isMonthRegistered(year, month))) {
          break;
        }
      }
    }

    return { month, year };
  }

  private async updateNextAvailableMonth(): Promise<void> {
    const nextMonth = await this.getNextAvailableMonth();
    this.nextAvailableMonth$.next(nextMonth);
  }

  async openRegisterMonthModal(reqMonth?: string, reqYear?: number): Promise<void> {
    let chosenMonth: string;
    let chosenYear: string;

    if (reqMonth && reqYear) {
      // El usuario selecciona el mes y el año manualmente
      chosenMonth = reqMonth;
      chosenYear = reqYear.toString();
    } else {
      // Lógica existente para calcular el siguiente mes disponible
      const monthYear = await this.getNextAvailableMonth();
      chosenMonth = monthYear.month;
      chosenYear = monthYear.year;
    }

    const dialogRef = this.dialog.open(RegisterMonthComponent, {
      width: '500px',
      disableClose: true,
      position: { top: '20px' },
      maxHeight: '90vh',
      data: {
        ...this.dataService.mainData().data,
        month: chosenMonth,
        year: chosenYear
      },
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        try {
          await this.billingHttp.setMonthlyBilling(
            '123',
            result.year,
            result.month,
            {
              totalAmount: result.totalAmountToPay,
              totalKwh: result.totalKwhConsumption,
              priceKwh: result.pricePerKwh,
              readings: result.readings,
              month: result.month,
              year: result.year
            }
          );
          await this.getUserData();
          this.updateNextAvailableMonth();
        } catch (error) {
          console.error('Error saving billing:', error);
        }
      }
    });
  }

  public convertTimestamps(monthBill: MonthlyBill): MonthlyBill {
    if (!monthBill || !monthBill.readings) return monthBill;
    const fixedReadings = monthBill.readings.map((reading) => {
      return {
        ...reading,
        readingDate: this.toValidDate(reading.readingDate),
        previousReadingDate: this.toValidDate(reading.previousReadingDate),
      };
    });
    return { ...monthBill, readings: fixedReadings };
  }

  private toValidDate(value: any): Date {
    if (value instanceof Date) return value;
    if (value && typeof value === 'object' && 'seconds' in value) {
      return new Date(value.seconds * 1000);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }
}
