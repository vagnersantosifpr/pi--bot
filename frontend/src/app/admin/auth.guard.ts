import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Usuário logado, pode acessar a rota
  }

  // Usuário não logado, redireciona para a página de login
  router.navigate(['/admin/login']);
  return false;
};