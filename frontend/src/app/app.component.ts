import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component'; // Importe o ChatComponent

@Component({
  selector: 'app-root',
  //standalone: true, // Transforme o AppComponent em standalone
  imports: [CommonModule, ChatComponent], // Importe o ChatComponent que ele usa no template
  template: `<app-chat></app-chat>`, // Template simplificado
  //styleUrls: ['./app.component.scss']

})
export class AppComponent {
  protected readonly title = signal('assisbot-frontend');
}
