import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../application/auth.state';

/**
 * Authentication Guard to protect private system routes.
 * Checks the central AuthState to verify if a valid session exists.
 *
 * @function authGuard
 */
export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
