
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      const token = localStorage.getItem('token');
      const isLoginRequest = req.url.includes('/api/Auth/login');
      const isForgotPasswordRequest =
        req.url.includes('/api/Auth/forgot-password');

      if (
        error.status === 401 &&
        token &&
        !isLoginRequest &&
        !isForgotPasswordRequest
      ) {
        localStorage.removeItem('token');
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
