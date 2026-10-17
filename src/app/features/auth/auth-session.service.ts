
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  private expiryTimer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {}

  startSession(token: string): void {
    this.clearTimer();

    try {
      const payload = token.split('.')[1];
      const normalizedPayload = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const decodedPayload = atob(normalizedPayload);
      const claims = JSON.parse(decodedPayload);
      const expiryTime = Number(claims.exp) * 1000;

      if (!Number.isFinite(expiryTime) || expiryTime <= Date.now()) {
        this.logout();
        return;
      }

      this.expiryTimer = setTimeout(() => {
        this.logout();
      }, Math.min(expiryTime - Date.now(),  2147483647));

      // Handle JWT lifetimes longer than the maximum timer delay.
      if (expiryTime - Date.now() > 2147483647) {
        this.expiryTimer = setTimeout(() => {
          this.startSession(token);
        }, 2147483647);    //24.7 days
      }
    } catch {
      this.logout();
    }
  }

  logout(): void {
    this.clearTimer();
    localStorage.removeItem('token');
    void this.router.navigate(['/login']);
  }

  clearTimer(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }
  }
}
