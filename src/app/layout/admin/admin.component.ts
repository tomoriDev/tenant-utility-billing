import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-admin',
  imports: [RouterModule, NavbarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminComponent implements OnInit {
  ngOnInit(): void {}
}
