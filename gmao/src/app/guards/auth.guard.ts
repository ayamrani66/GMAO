import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ✅ On ajoute ' = []' pour que le tableau soit vide par défaut si on ne passe rien
export function authGuard(allowedRoles: string[] = []): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();

    // 1. Si l'utilisateur n'est pas connecté -> redirection Login
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    // 2. On ne vérifie les rôles QUE si des rôles spécifiques ont été fournis
    if (allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        router.navigate(['/modules']); // Redirection si le rôle n'est pas autorisé
        return false;
      }
    }

    // Si connecté et (pas de restriction de rôle OU rôle valide) -> Accès autorisé
    return true;
  };
}