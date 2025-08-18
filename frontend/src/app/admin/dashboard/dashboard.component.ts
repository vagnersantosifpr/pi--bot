import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService, ConversationSnippet, KnowledgeItem } from '../admin-api.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  activeTab: 'history' | 'knowledge' | 'users' = 'history';
  userName: string = '';

  conversations: ConversationSnippet[] = [];
  knowledgeBase: KnowledgeItem[] = [];
  isLoading: boolean = true; // Adiciona uma flag de carregamento
  error: string | null = null;   // Para exibir mensagens de erro

  selectedConversation: any = null;

  constructor(
    private adminApi: AdminApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('authUser') || '{}');
    this.userName = user.name || 'Admin';
    this.loadInitialData();
    this.loadConversations();
    // Carregue os outros dados também
    this.loadKnowledgeBase();
    
  }
  
  loadConversations(): void {
    this.isLoading = true;
    this.error = null;
    console.log("Buscando histórico de conversas..."); // Log de depuração

    this.adminApi.getConversationSnippets().subscribe({
      next: (data) => {
        this.conversations = data;
        this.isLoading = false;
        console.log("Conversas carregadas com sucesso:", data); // Log de sucesso
      },
      error: (err) => {
        this.error = "Falha ao carregar o histórico de conversas.";
        this.isLoading = false;
        console.error("Erro ao buscar conversas:", err); // Log de erro
      }
    });
  }
  
   loadKnowledgeBase(): void {
    console.log("Buscando base de conhecimento..."); // Log de depuração
    
    this.adminApi.getKnowledgeBase().subscribe({
      next: (data) => {
        this.knowledgeBase = data;
        console.log("Base de conhecimento carregada com sucesso:", data); // Log de sucesso
      },
      error: (err) => {
        console.error("Erro ao buscar base de conhecimento:", err); // Log de erro
        // Opcional: setar uma variável de erro para exibir na tela
      }
    });
  }

  deleteKnowledgeItem(id: string): void {
    if (confirm('Tem certeza que deseja excluir este item da base de conhecimento? Esta ação não pode ser desfeita.')) {
      this.adminApi.deleteKnowledgeItem(id).subscribe({
        next: () => {
          // Recarrega a lista após a exclusão
          this.knowledgeBase = this.knowledgeBase.filter(item => item._id !== id);
          console.log(`Item ${id} deletado com sucesso.`);
        },
        error: (err) => {
          console.error(`Erro ao deletar item ${id}:`, err);
          alert('Ocorreu um erro ao excluir o item.');
        }
      });
    }
  }
  
  loadInitialData(): void {
    this.adminApi.getConversationSnippets().subscribe(data => this.conversations = data);
    this.adminApi.getKnowledgeBase().subscribe(data => this.knowledgeBase = data);
  }

  setActiveTab(tab: 'history' | 'knowledge' | 'users'): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
  }

  viewConversation(id: string): void {
    this.adminApi.getConversationById(id).subscribe(data => {
      this.selectedConversation = data;
    });
  }
  
  
}