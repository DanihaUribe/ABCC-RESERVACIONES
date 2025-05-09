import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  if (!token || !userData) {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(userData);
  const allowedRoles = route.data?.['role'] as string[];

  if (allowedRoles && !allowedRoles.includes(user.userRole)) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
