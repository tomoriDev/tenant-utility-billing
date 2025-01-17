import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    loadComponent: () => import('@app/layout/admin/admin.component').then((m) => m.AdminComponent),
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadComponent: () => import('@app/views/admin/main/main.component').then((m) => m.MainComponent),
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'admin',
  },
];