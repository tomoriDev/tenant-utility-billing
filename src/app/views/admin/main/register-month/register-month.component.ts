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
import { ConsumptionCalculatorService } from '@app/services/consumption-calculator.service';

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
  isEditMode = false;
  existingBilling: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegisterFormComponent>,
    private userHttp: UserHttpService,
    private cdr: ChangeDetectorRef,
    private calculator: ConsumptionCalculatorService
  ) {
    this.existingBilling = data?.billing?.[data.year]?.[data.month];
    this.isEditMode = !!this.existingBilling;

    this.registerForm = this.fb.group({
      totalAmountToPay: [this.existingBilling?.totalAmount || '', Validators.required],
      kwhConsumption: [this.existingBilling?.totalKwh || '', Validators.required],
      readingDate: [new Date(), Validators.required],
      tenants: this.fb.array([])
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadLastReadings();
    this.setTenants();
    this.updateFormValues();
  }

  async loadLastReadings() {
    this.lastReadings = await this.userHttp.getPreviousMonthReadings(
      '123',
      this.data.year,
      this.data.month
    );
    console.log('Previous month readings:', this.lastReadings);
  }

  get tenants(): FormArray {
    return this.registerForm.get('tenants') as FormArray;
  }

  setTenants(): void {
    if (this.data?.tenants) {
      this.data.tenants.forEach((tenant: any) => {
        // Si estamos editando, buscar la lectura existente
        const existingReading = this.existingBilling?.readings?.find(
          (r: any) => r.tenantId === tenant.firebaseId
        );

        const lastReading = this.lastReadings.get(tenant.firebaseId) ?? tenant.initialReading ?? 0;
        
        this.tenants.push(
          this.fb.group({
            newReading: [
              existingReading?.currentReading || '',
              [Validators.required, Validators.min(lastReading)]
            ],
            previousReading: [{ value: lastReading, disabled: true }],
            consumption: [{ value: existingReading?.consumption || 0, disabled: true }],
            readingDate: [existingReading?.readingDate || new Date()]
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
    console.log(this.data)
    if (this.registerForm.valid) {

      const { totalAmountToPay, kwhConsumption, readingDate } = this.registerForm.value;
      const pricePerKwh = +(totalAmountToPay / kwhConsumption).toFixed(3);

      const readings = this.data.tenants.map((tenant: any, index: number) => {
        const formGroup = this.tenants.at(index);
        const newReading = Number(formGroup.get('newReading')?.value);
        const previousReading = Number(formGroup.get('previousReading')?.value);

        // Buscar la última lectura registrada
        const prevMonth = (parseInt(this.data.month, 10) - 1).toString().padStart(2, '0');
        const lastReading = this.data.billing?.[this.data.year]?.[prevMonth]
          ?.readings?.find((r: any) => r.tenantId === tenant.firebaseId);

        console.log(tenant)

        // Si existe lastReading, usar su readingDate; de lo contrario, usar initialEmissionDate
        const previousReadingDate = lastReading
          ? lastReading.readingDate
          : tenant.initialEmissionDate;

        const prevDateCalc = previousReadingDate?.toDate
          ? previousReadingDate.toDate()
          : new Date(previousReadingDate);

        const currentReadingDate = readingDate || new Date();
        const currDateCalc = currentReadingDate?.toDate
          ? currentReadingDate.toDate()
          : new Date(currentReadingDate);

        // Cálculo
        const metrics = this.calculator.calculateConsumptionMetrics(
          prevDateCalc,
          newReading,
          previousReading,
          currDateCalc,
          pricePerKwh
        );

        // Retorno en crudo, sin convertir a Timestamp. Esto se hará en billing.service
        return {
          tenantId: tenant.firebaseId,
          name: tenant.name,
          currentReading: newReading,
          previousReading,
          readingDate: currDateCalc,
          previousReadingDate: prevDateCalc,
          isFirstReading: !lastReading,
          ...metrics
        };
      });

      this.dialogRef.close({
        save: true,
        totalAmountToPay: Number(totalAmountToPay),
        totalKwhConsumption: Number(kwhConsumption),
        pricePerKwh,
        readings,
        month: this.data.month,
        year: this.data.year,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
