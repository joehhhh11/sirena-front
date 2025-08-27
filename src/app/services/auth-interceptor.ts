import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const http = inject(HttpClient);

  const token = auth.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true 
    });
  } else {
    req = req.clone({ withCredentials: true }); 
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return http
          .post<any>(
            'http://localhost:3000/api/auth/refresh',
            {},
            { withCredentials: true } 
          )
          .pipe(
            switchMap((res) => {
              localStorage.setItem('access_token', res.accessToken);
              const cloned = req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` },
                withCredentials: true
              });
              return next(cloned);
            }),
            catchError(() => {
              auth.logout();
              return throwError(() => error);
            })
          );
      }
      return throwError(() => error);
    })
  );
};
