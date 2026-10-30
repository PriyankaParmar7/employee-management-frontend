import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Layout } from './shared/layout/layout';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/employees')
            .then(m => m.Employees)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
