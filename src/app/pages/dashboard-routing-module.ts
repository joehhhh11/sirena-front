import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { AuthGuard } from '../guards/auth.guard';
import { Dashboard } from './dashboard';

const routes: Routes = [
    {
    path: '',
    component: Dashboard ,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'peliculas',
        loadComponent: () =>
          import('./panel/peliculas/peliculas').then(m => m.Peliculas),
      },
      {
        path: 'turnos',
        loadComponent: () =>
          import('./panel/turnos/turnos').then(m => m.Turnos),
      }
     
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
