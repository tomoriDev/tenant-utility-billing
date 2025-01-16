import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'main',
    loadComponent: () => import('./views/main/main.component').then((m) => m.MainComponent),
  },
  {
    path: '**',
    redirectTo: 'main',
  },
];
