import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown'; // 1. IMPORTE AQUI

import { routes } from './app.routes';
import { tokenInterceptor } from './admin/token.interceptor'; // Importe a VERSÃO FUNCIONAL do interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Configura o HttpClient e registra o interceptor
    provideHttpClient(
      withInterceptors([tokenInterceptor])
    ),
    provideMarkdown() // 2. ADICIONE O PROVIDER AQUI

  ]
};
