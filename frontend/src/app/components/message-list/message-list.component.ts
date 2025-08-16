// src/app/components/message-list/message-list.component.ts
import { Component, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Message } from '../../message.model';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements AfterViewChecked {
  // Recebe o array de mensagens do componente pai
  @Input() messages: Message[] = [];
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Este método é chamado toda vez que a view é checada.
  // Usamos para rolar para a última mensagem.
  ngAfterViewChecked() {        
      this.scrollToBottom();        
  }

  private scrollToBottom(): void {
      try {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch(err) { }                 
  }
}