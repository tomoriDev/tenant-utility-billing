import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
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
export class RegisterMonthComponent {
  registerForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegisterFormComponent>
  ) {
    this.registerForm = this.fb.group({
      totalAmountToPay: ['', Validators.required],
      kwhConsumption: ['', Validators.required],
      tenants: this.fb.array([]),
    });
    this.setTenants();
  }

  get tenants(): FormArray {
    return this.registerForm.get('tenants') as FormArray;
  }

  setTenants(): void {
    console.log(this.data);
    if (this.data) {
      this.data.tenants.forEach(() => {
        this.tenants.push(
          this.fb.group({
            newReading: ['', Validators.required],
          })
        );
      });
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.dialogRef.close(this.registerForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
