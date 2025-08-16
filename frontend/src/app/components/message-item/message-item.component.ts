// src/app/components/message-item/message-item.component.ts
import { Component, Input } from '@angular/core';
import { Message } from '../../message.model';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent {
  // Recebe o objeto da mensagem do componente pai
  @Input() message!: Message; 
}