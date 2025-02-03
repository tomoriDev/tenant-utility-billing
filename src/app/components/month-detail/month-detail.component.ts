import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MonthlyBill } from '@app/interface/tenant';

@Component({
  selector: 'app-month-detail',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './month-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthDetailComponent {
  monthDetail = input({} as MonthlyBill);
}
