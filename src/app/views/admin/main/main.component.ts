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
@Component({
  selector: 'app-main',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatExpansionModule,
    MonthDetailComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class MainComponent implements OnInit {
  formData?: any;

  currentYear = 2025;

  months = ['01', '02', '03'];

  DataStatus = DataStatus;

  lastReadings = new Map<string, number>();

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    public billingHttp: BillingHttpService,
    public userHttp: UserHttpService,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {
    // this.openModal();
    this.getUserData();
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

  openRegisterMonthModal(): void {
    const dialogRef = this.dialog.open(RegisterMonthComponent, {
      width: '500px',
      disableClose: true,
      position: { top: '20px' },
      maxHeight: '90vh',
      data: {
        ...this.dataService.mainData().data,
        month: '01',
        year: '2025'
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
              timestamp: result.timestamp,
              month: result.month,
              year: result.year
            }
          );
          
          await this.getUserData();
        } catch (error) {
          console.error('Error saving billing:', error);
        }
      }
    });
  }
}
