import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'home', loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'schedule', loadComponent: () => import('./pages/schedule/schedule.component').then(m => m.ScheduleComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent), 
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
  }
];
