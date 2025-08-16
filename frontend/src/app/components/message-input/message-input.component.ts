// src/app/components/message-input/message-input.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- IMPORTAR

@Component({
  selector: 'app-message-input',
  //standalone: true, // <-- ESSENCIAL
  imports: [FormsModule], // <-- ADICIONAR
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss']
})
export class MessageInputComponent {
  // Output emite um evento para o componente pai
  @Output() sendMessage = new EventEmitter<string>();

  messageText: string = '';

  // Método chamado quando o formulário é enviado
  submitMessage(): void {
    if (this.messageText.trim()) {
      this.sendMessage.emit(this.messageText);
      this.messageText = ''; // Limpa o campo de input
    }
  }
}