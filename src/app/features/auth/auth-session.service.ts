
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

  getLoggedInUserName(): string {
  const token = localStorage.getItem('token');

  if (!token) {
    return '';
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return '';
    }

    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '='
    );

    const claims = JSON.parse(
      atob(paddedPayload)
    ) as Record<string, unknown>;

    const nameClaimKeys = [
      'name',
      'Name',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
    ];

    for (const key of nameClaimKeys) {
      const value = claims[key];

      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return '';
  } catch {
    return '';
  }
}

getLoggedInUserRole(): string {
  const token = localStorage.getItem('token');

  if (!token) {
    return '';
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return '';
    }

    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '='
    );

    const claims = JSON.parse(
      atob(paddedPayload)
    ) as Record<string, unknown>;

    const roleClaimKeys = [
      'role',
      'roles',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ];

    for (const key of roleClaimKeys) {
      const value = claims[key];

      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return '';
  } catch {
    return '';
  }
}
}
