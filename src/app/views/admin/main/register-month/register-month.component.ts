import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RegisterFormComponent } from '../register-form/register-form.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { UserHttpService } from '@app/http/user.service';

@Component({
  selector: 'app-register-month',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
  ],
  templateUrl: './register-month.component.html',
  styleUrl: './register-month.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  standalone: true,
})
export class RegisterMonthComponent implements OnInit {
  registerForm: FormGroup;

  lastReadings = new Map<string, number>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegisterFormComponent>,
    private userHttp: UserHttpService,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      totalAmountToPay: ['', Validators.required],
      kwhConsumption: ['', Validators.required],
      tenants: this.fb.array([]),
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadLastReadings();
    this.setTenants();
    this.updateFormValues();
  }

  async loadLastReadings() {
    this.lastReadings = await this.userHttp.getLastReadings('123');
    console.log('Last readings loaded:', this.lastReadings);
  }

  get tenants(): FormArray {
    return this.registerForm.get('tenants') as FormArray;
  }

  setTenants(): void {
    if (this.data?.tenants) {
      this.data.tenants.forEach((tenant: any) => {
        // Obtener la última lectura o usar la lectura inicial del tenant
        const lastReading = this.lastReadings.get(tenant.firebaseId) ?? tenant.initialReading ?? 0;
        
        console.log(`Setting up tenant ${tenant.name}:`, {
          firebaseId: tenant.firebaseId,
          lastReading,
          initialReading: tenant.initialReading,
          fromLastReadings: this.lastReadings.get(tenant.firebaseId)
        });

        this.tenants.push(
          this.fb.group({
            newReading: ['', [Validators.required, Validators.min(lastReading)]],
            previousReading: [{ value: lastReading, disabled: true }],
            consumption: [{ value: 0, disabled: true }],
          })
        );
      });
    }
  }

  private updateFormValues(): void {
    this.tenants.controls.forEach((control, index) => {
      const tenant = this.data.tenants[index];
      const lastReading = this.lastReadings.get(tenant.firebaseId) ?? tenant.initialReading ?? 0;

      control.patchValue(
        {
          previousReading: lastReading,
        },
        { emitEvent: false }
      );
    });

    this.cdr.detectChanges();
  }

  calculateConsumption(index: number) {
    const group = this.tenants.at(index) as FormGroup;
    const newReading = group.get('newReading')?.value || 0;
    const previousReading = group.get('previousReading')?.value || 0;
    group.get('consumption')?.setValue(newReading - previousReading);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { totalAmountToPay, kwhConsumption } = this.registerForm.value;
      const pricePerKwh = +(totalAmountToPay / kwhConsumption).toFixed(3);

      this.dialogRef.close({
        totalAmountToPay: Number(totalAmountToPay),
        totalKwhConsumption: Number(kwhConsumption),
        pricePerKwh,
        month: this.data.month,
        year: this.data.year,
        readings: this.data.tenants.map((tenant: any, index: number) => {
          const formGroup = this.tenants.at(index);
          const consumption = formGroup.get('consumption')?.value || 0;
          const previousReading = formGroup.get('previousReading')?.value || 0;
          const currentReading = Number(formGroup.get('newReading')?.value);
          
          return {
            tenantId: tenant.firebaseId,
            name: tenant.name,
            previousReading,
            currentReading,
            consumption: Number(consumption),
            amount: +(consumption * pricePerKwh).toFixed(2),
            readingDate: new Date()
          };
        }),
        timestamp: new Date()
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
