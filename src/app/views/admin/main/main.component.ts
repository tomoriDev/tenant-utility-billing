import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterFormComponent } from './register-form/register-form.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { DataService } from '@app/services/data.service';
import { CommonModule } from '@angular/common';
import { RegisterMonthComponent } from './register-month/register-month.component';
import { FirebaseService } from '@app/services/firebase.service';

@Component({
  selector: 'app-main',
  imports: [ReactiveFormsModule, CommonModule, MatExpansionModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class MainComponent implements OnInit {
  formData?: any;

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    public firebaseService: FirebaseService
  ) {}
  ngOnInit(): void {
    // this.openModal();
    this.getUserData();
  }

  async getUserData(): Promise<void> {
    const userData = await this.firebaseService.getUserData('123');
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

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log(this.dataService.mainData());
        console.log('Modal closed with data:', this.formData);
      }
    });
  }
}
