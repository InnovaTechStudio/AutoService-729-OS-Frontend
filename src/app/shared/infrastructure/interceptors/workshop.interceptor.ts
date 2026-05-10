// src/app/shared/infrastructure/interceptors/workshop.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const workshopInterceptor: HttpInterceptorFn = (req, next) => {
  const userJson = localStorage.getItem('user');
  const workshopId = userJson ? JSON.parse(userJson).id : null;

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
