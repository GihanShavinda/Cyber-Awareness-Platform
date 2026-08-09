import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getUser()?.role;
  if (['SUPER_ADMIN', 'ORG_ADMIN'].includes(role)) {
    return true;
  }
  router.navigate(['/dashboard']);
  return false;
};
