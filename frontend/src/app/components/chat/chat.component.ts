// src/app/components/chat/chat.component.ts
import { Component, OnInit } from '@angular/core';
import { ChatApiService } from '../../services/chat-api.service';
import { Message } from '../../message.model';
import { v4 as uuidv4 } from 'uuid'; // Precisaremos de uma lib de UUID

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  userId: string = '';

  constructor(private chatApi: ChatApiService) {}

  ngOnInit(): void {
    // Gera ou recupera um userId único para o usuário
    this.userId = localStorage.getItem('assisbot_userId') || uuidv4();
    localStorage.setItem('assisbot_userId', this.userId);

    // Mensagem inicial de boas-vindas
    this.messages.push({
      role: 'model',
      text: 'Olá! Sou o AssisBot, seu assistente de convivência do IFPR. Como posso ajudar você hoje?'
    });
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
}