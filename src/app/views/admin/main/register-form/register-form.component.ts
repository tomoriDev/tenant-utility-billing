import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [provideNativeDateAdapter()],
})
export class RegisterFormComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegisterFormComponent>
  ) {
    this.registerForm = this.fb.group({
      emissionDate: ['', Validators.required],
      tenants: this.fb.array([]),
    });
  }

  get tenants(): FormArray {
    return this.registerForm.get('tenants') as FormArray;
  }

  addTenant(): void {
    const tenantForm = this.fb.group({
      name: ['', Validators.required],
      lastReading: ['', [Validators.required, Validators.min(0)]],
    });
    this.tenants.push(tenantForm);
  }

  removeTenant(index: number): void {
    this.tenants.removeAt(index);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.dialogRef.close(this.registerForm.value);
    }
  }
}
