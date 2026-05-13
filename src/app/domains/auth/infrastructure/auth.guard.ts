import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Authentication Guard to protect private system routes.
 * * This functional guard verifies if there is an active user session by
 * checking the `AuthService`. If the user is authenticated, it allows
 * navigation to the requested route. If no user is detected (e.g., when
 * entering in incognito mode or without previous credentials), it blocks
 * access and automatically redirects to the login view.
 * * @function authGuard
 * @param route - Information about the specific route the user is trying to access.
 * @param state - The current state of the router at the time of the request.
 * @returns {boolean} `true` if access is granted, `false` if denied and redirected to login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if a logged-in user exists in the current session
  if (authService.currentUser) {
    return true;
  }

  // If no user is found, redirect to the login screen
  router.navigate(['/login']);
  return false;
};
