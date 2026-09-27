import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const username = 'admin';
  const password = 'admin';

  const authReq = req.clone({
    setHeaders: {
      Authorization: 'Basic ' + btoa(username + ':' + password)
    }
  });

  return next(authReq);
};