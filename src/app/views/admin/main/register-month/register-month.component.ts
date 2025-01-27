import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-register-month',
  imports: [],
  templateUrl: './register-month.component.html',
  styleUrl: './register-month.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class RegisterMonthComponent implements OnInit {

  ngOnInit(): void { }

}
