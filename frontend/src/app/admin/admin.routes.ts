import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';  
import { authGuard } from './auth.guard'; // A guarda de rota que já criamos

export const ADMIN_ROUTES: Routes = [
  { 
    path: 'login', 
    component: LoginComponent
   },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] // Protege a rota do dashboard
  },
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  } // Rota padrão /admin -> /admin/dashboard
];