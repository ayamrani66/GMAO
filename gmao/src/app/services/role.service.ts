// services/role.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  constructor(private authService: AuthService) {}

  get role(): string {
    return this.authService.getCurrentUser()?.role ?? '';
  }

  isResponsable() { return this.role === 'RESPONSABLE'; }
  isManager()     { return this.role === 'MANAGER'; }
  isSuperviseur() { return this.role === 'SUPERVISEUR'; }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.role);
  }
}