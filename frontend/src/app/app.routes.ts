import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserHomeComponent } from './pages/user-home/user-home.component';
import { AuthGuard } from './guards/auth.guard';
import { ReservationAvailabilityComponent } from './pages/reservation-availability/reservation-availability.component';
import { EditReservationComponent } from './pages/edit-reservation/edit-reservation.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Jefe de departamento'] }
  },
  {
    path: 'user-home',
    component: UserHomeComponent,
    data: { roles: ['Empleado'] }
  },
  {
    path: 'reservation-availability',
    component: ReservationAvailabilityComponent,
    data: { roles: ['Administrador', 'Empleado'] }
  },
  {
    path: 'edit-reservation',
    component: EditReservationComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Jefe de departamento'] }
  }
];
