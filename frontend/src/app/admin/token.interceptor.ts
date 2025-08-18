// client/src/app/admin/token.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Exporta uma constante (função), não uma classe
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeta o serviço de autenticação
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Se existe um token...
  if (token) {
    // ...clona a requisição e adiciona o cabeçalho de autorização.
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Passa a requisição clonada para o próximo manipulador.
    return next(clonedReq);
  }

  // Se não houver token, passa a requisição original sem modificação.
  return next(req);
};