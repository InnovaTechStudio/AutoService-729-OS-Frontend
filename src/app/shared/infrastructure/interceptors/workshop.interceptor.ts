/**
 * Workshop Interceptor
 * 
 * Interceptor HTTP that automatically injects the `workshopId` of the authenticated workshop
 * into all requests to the backend.
 * 
 * This allows a single backend to serve multiple workshops, filtering data based on the workshop of the logged-in user.
 * 
 * @interceptor
 */

// src/app/shared/infrastructure/interceptors/workshop.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const workshopInterceptor: HttpInterceptorFn = (req, next) => {
  const userJson = localStorage.getItem('user');
  const workshopId = userJson ? JSON.parse(userJson).id : null;

  // Do not modify requests to /workshops (login) even if there is no workshopId
  if (!workshopId || req.url.includes('/workshops')) {
    return next(req);
  }

  let modifiedReq = req;

  if (req.method === 'GET') {
    modifiedReq = req.clone({ setParams: { workshopId } });
  } else if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const body = req.body && typeof req.body === 'object' ? { ...req.body, workshopId } : { workshopId };
    modifiedReq = req.clone({ body });
  }

  return next(modifiedReq);
};
