// src/app/components/message-item/message-item.component.ts
import { Component, Input, HostBinding } from '@angular/core';
import { Message } from '../../message.model';
import { CommonModule } from '@angular/common'; // <-- IMPORTAR
import { MarkdownModule } from 'ngx-markdown'; // <-- Importe o módulo aqui


@Component({
  selector: 'app-message-item',
  //standalone: true, // <-- ESSENCIAL
  imports: [CommonModule, MarkdownModule], // <-- E adicione aos imports do componente
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent {
  // Recebe o objeto da mensagem do componente pai
  @Input() message!: Message; // Recebe o objeto da mensagem

  // Adiciona a classe 'user-message' ou 'model-message' ao elemento host do componente
  @HostBinding('class.user-message')
  public get isUser(): boolean {
    return this.message?.role === 'user';
  }

  @HostBinding('class.model-message')
  public get isModel(): boolean {
    return this.message?.role === 'model' || this.message?.role === 'loading';
  }
}