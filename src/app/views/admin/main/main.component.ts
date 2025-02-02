import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterFormComponent } from './register-form/register-form.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { DataService } from '@app/services/data.service';
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

  months = ['Enero', 'Febrero', 'Marzo'];

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    public billingHttp: BillingHttpService,
    public userHttp: UserHttpService
  ) {}
  ngOnInit(): void {
    // this.openModal();
    this.getUserData();
  }

  async getUserData(): Promise<void> {
    const userData = await this.userHttp.getUserData('123');
    this.dataService.mainData.set(userData);
    console.log(userData);
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
      data: this.dataService.mainData(),
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        console.log(result);
        console.log('Modal closed with data:', result);
        await this.billingHttp.setMonthlyBilling('123', '2025', '01', {
          totalAmount: 1600,
          totalKwh: 388,
          priceKwh: 4.12,
          readings: {
            tenant1: {
              consumption: 200,
              currentReading: 2000,
              previousReading: 1800,
              amount: 64.23,
              name: 'Felicia Mori',
              readingDate: new Date(),
            },
            tenant2: {
              consumption: 188,
              currentReading: 10000,
              name: 'John Doe',
              amount: 64.23,
              previousReading: 9888,
              readingDate: new Date(),
            },
          },
          timestamp: new Date(),
        });
      }
    });
  }
}
