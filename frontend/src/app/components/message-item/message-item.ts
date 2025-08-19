import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown'; // <-- Importe o módulo aqui

@Component({
  selector: 'app-message-item',
  imports: [MarkdownModule], // <-- E adicione aos imports do componente
  templateUrl: './message-item.html',
  styleUrl: './message-item.scss'
})
export class MessageItem {

}
