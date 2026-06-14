import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  let token = localStorage.getItem('token');

  if (token) {
    token = token.replace(/['"]+/g, '');
  }

  const isPublicEndpoint =
    req.url.includes('/auth/') || req.url.includes('/tracking/') || req.url.includes('/inventory/');

  if (token && !isPublicEndpoint) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
