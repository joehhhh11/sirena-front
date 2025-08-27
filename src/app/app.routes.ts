import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AuthGuard } from './guards/auth.guard';
import { Dashboard } from './pages/dashboard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', loadChildren:() => import ("./pages/dashboard-routing-module").then(m=>m.DashboardRoutingModule), canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
