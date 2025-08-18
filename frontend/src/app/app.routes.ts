import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component'; // Importe o ChatComponent

export const routes: Routes = [
  // Suas rotas existentes (como a rota do chat)
  // { path: '', component: ChatComponent }, // Exemplo

  {
    path: '',
    component: ChatComponent
  },
  // NOVA ROTA PARA O PAINEL ADMIN com LAZY-LOADING
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // Opcional: Rota "catch-all" para redirecionar para a página inicial
  { path: '**', redirectTo: '' }
  // Outras rotas, como redirecionamentos...
];