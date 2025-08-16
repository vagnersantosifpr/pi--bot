// src/app/components/chat/chat.component.ts
import { Component, OnInit, ViewChild,   ElementRef } from '@angular/core';
import { ChatApiService } from '../../services/chat-api.service';
import { Message } from '../../message.model';
import { v4 as uuidv4 } from 'uuid'; // Precisaremos de uma lib de UUID
import { MessageListComponent } from '../message-list/message-list.component'; // <-- IMPORTAR
import { MessageInputComponent } from '../message-input/message-input.component'; // <-- IMPORTAR

@Component({
  selector: 'app-chat',
  imports: [MessageListComponent, MessageInputComponent], // <-- ADICIONAR
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  userId: string = '';
  private shouldScrollDown = false; // Flag para controlar a rolagem

  @ViewChild('messagesArea') private messagesArea!: ElementRef;

  constructor(private chatApi: ChatApiService) { }

  ngOnInit(): void {
    // Gera ou recupera um userId único para o usuário
    this.userId = localStorage.getItem('assisbot_userId') || uuidv4();
    localStorage.setItem('assisbot_userId', this.userId);

    // Mensagem inicial de boas-vindas
    this.messages.push({
      role: 'model',
      text: 'Daí! Eu sou o E.L.O., mas pode me chamar de Piá-bot. Sou seu canal de apoio aqui no IFPR. Manda a braba aí, no que posso te ajudar?'
    });
  }

  

  ngAfterViewChecked(): void {
    // Este método é chamado após cada verificação de mudança de view.
    if (this.shouldScrollDown) {
      this.scrollToBottom();
      this.shouldScrollDown = false; // Reseta a flag
    }
  }

  handleSendMessage(text: string): void {
    // Adiciona a mensagem do usuário à tela
    this.messages.push({ role: 'user', text });

    // Adiciona um indicador de "carregando"
    this.messages.push({ role: 'loading', text: '' });

    // Chama a API
    this.chatApi.sendMessage(this.userId, text).subscribe({
      next: (response) => {
        // Remove o indicador de "carregando"
        this.messages.pop();
        // Adiciona a resposta do bot
        this.messages.push({ role: 'model', text: response.reply });
      },
      error: (err) => {
        // Remove o indicador de "carregando" e mostra uma mensagem de erro
        this.messages.pop();
        this.messages.push({ role: 'model', text: 'Desculpe, ocorreu um erro. Tente novamente mais tarde.' });
        console.error(err);
      }
    });
  }

  private scrollToBottom(): void {
    // Usamos um pequeno timeout para garantir que o DOM foi totalmente atualizado
    // antes de tentarmos rolar. Sem isso, a rolagem pode acontecer antes da
    // nova mensagem ter sua altura final calculada.
    setTimeout(() => {
      try {
        const container = this.messagesArea.nativeElement;
        container.scrollTop = container.scrollHeight;
      } catch (err) {
        console.error('Erro ao rolar a view:', err);
      }
    }, 0);
  }


}