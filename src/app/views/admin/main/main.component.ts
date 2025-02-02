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

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    public billingHttp: BillingHttpService,
    public userHttp: UserHttpService
  ) {}

  ngOnInit(): void {
    this.getUserData();
  }

  async getUserData(): Promise<void> {
    this.dataService.setLoading(this.dataService.mainData);
    try {
      const userData = await this.userHttp.getUserData('123');
      this.dataService.setSuccess(this.dataService.mainData, userData);
      this.dataService.setDataSource(this.dataService.mainData, userData);
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

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.dataService.mainData.set(result);
        this.formData = result;
        console.log('Modal closed with data:', this.formData);
      }
    });
  }

  openRegisterMonthModal(): void {
    const dialogRef = this.dialog.open(RegisterMonthComponent, {
      width: '500px',
      disableClose: true,
      position: { top: '20px' },
      maxHeight: '90vh',
      data: this.dataService.mainData().data,
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        console.log(result);
        console.log('Modal closed with data:', result);
        await this.billingHttp.setMonthlyBilling('123', '2025', '01', {
          totalAmount: 1600,
          totalKwh: 388,
          priceKwh: 4.12,
          readings: [
            {
              id: 'tenant1',
              consumption: 100,
              currentReading: 100,
              previousReading: 100,
              amount: 100.23,
              name: 'Felicia Mori 100',
              readingDate: new Date(),
            },
            {
              id: 'tenant2',
              consumption: 100,
              currentReading: 100,
              name: 'John Doe 100',
              amount: 100.23,
              previousReading: 100,
              readingDate: new Date(),
            },
          ],
          timestamp: new Date(),
        });
      }
    });
  }
}
