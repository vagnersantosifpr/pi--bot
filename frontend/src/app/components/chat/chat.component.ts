// src/app/components/chat/chat.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- 1. IMPORTE O FORMSMODULE

// Imports dos seus componentes e serviços
import { MessageListComponent } from '../message-list/message-list.component'; // <-- IMPORTAR
import { MessageInputComponent } from '../message-input/message-input.component'; // <-- IMPORTAR
import { ChatApiService } from '../../services/chat-api.service';
import { Message } from '../../message.model';
import { v4 as uuidv4 } from 'uuid'; // Precisaremos de uma lib de UUID
import { Router } from '@angular/router';


@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule,
    MessageListComponent,
    MessageInputComponent], // <-- ADICIONAR
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  userId: string = '';
  private shouldScrollDown = false; // Flag para controlar a rolagem

  chatTemperature: number = 1.0; // Valor padrão neutro

  @ViewChild('messagesArea') private messagesArea!: ElementRef;

  constructor(private chatApi: ChatApiService, private router: Router) { }

  ngOnInit(): void {
    // Gera ou recupera um userId único para o usuário
    this.userId = localStorage.getItem('assisbot_userId') || uuidv4();
    localStorage.setItem('assisbot_userId', this.userId);

    // Recupera a temperatura salva, se existir
    const savedTemp = localStorage.getItem('piabot_temperature');
    this.chatTemperature = savedTemp ? parseFloat(savedTemp) : 1.0;


    // Mensagem inicial de boas-vindas
    this.messages.push({
      role: 'model',
      text: 'Daí! Eu sou o ELO, mas pode me chamar de Piá-bot. Sou seu canal de apoio aqui no IFPR. No que posso te ajudar?'
    });
  }

  // Novo método para salvar a temperatura quando o slider muda
  onTemperatureChange(): void {
    localStorage.setItem('piabot_temperature', this.chatTemperature.toString());
  }



  ngAfterViewChecked(): void {
    // Este método é chamado após cada verificação de mudança de view.
    if (this.shouldScrollDown) {
      this.scrollToBottom();
      this.shouldScrollDown = false; // Reseta a flag
    }
  }

  async handleSendMessage(text: string): Promise<void> {
    // ...
    try {
      const response = await this.chatApi.sendMessage(this.userId, text, this.chatTemperature);
      // 'response' já é o objeto { reply: "..." }
      this.messages.pop(); // Remove o loading
      this.messages.push({ role: 'model', text: response.reply });
      this.shouldScrollDown = true;
    } catch (error) {
      // ...
    }
  }

  handleSendMessage1(text: string): void {
    // Adiciona a mensagem do usuário à tela
    this.messages.push({ role: 'user', text });

    // Adiciona um indicador de "carregando"
    this.messages.push({ role: 'loading', text: '' });


    // Chama a API
    // this.chatApi.sendMessage(this.userId, text, this.chatTemperature).subscribe({
    //   next: (response: { reply: any; }) => {
    //     // Remove o indicador de "carregando"
    //     this.messages.pop();
    //     // Adiciona a resposta do bot
    //     this.messages.push({ role: 'model', text: response.reply });
    //     this.shouldScrollDown = true;

    //   },
    //   error: (err: any) => {
    //     // Remove o indicador de "carregando" e mostra uma mensagem de erro
    //     this.messages.pop();
    //     this.messages.push({ role: 'model', text: 'Desculpe, ocorreu um erro. Tente novamente mais tarde.' });
    //     console.error(err);
    //   }
    // });
  }

  // 3. ADICIONE O NOVO MÉTODO
  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
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