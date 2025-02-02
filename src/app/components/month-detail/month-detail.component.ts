import { ChangeDetectionStrategy, Component, input, Input, type OnInit } from '@angular/core';
import { MonthlyBill } from '@app/interface/tenant';

@Component({
  selector: 'app-month-detail',
  imports: [],
  templateUrl: './month-detail.component.html',
  styleUrl: './month-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MonthDetailComponent implements OnInit {
  monthDetail = input({} as MonthlyBill);
  
  ngOnInit(): void {}

}
