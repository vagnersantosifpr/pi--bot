// src/app/app.module.ts -> VERSÃO FINAL E CORRETA
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // Necessário para *ngIf, *ngFor, etc.
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Necessário para [(ngModel)]

// Importando todos os nossos componentes
import { AppComponent } from './app.component';
import { ChatComponent } from './components/chat/chat.component';
import { MessageListComponent } from './components/message-list/message-list.component';
import { MessageItemComponent } from './components/message-item/message-item.component';
import { MessageInputComponent } from './components/message-input/message-input.component';

@NgModule({
  // 1. DECLARE todos os componentes que pertencem a este módulo.
  declarations: [
    AppComponent,
    ChatComponent,
    MessageListComponent,
    MessageItemComponent,
    MessageInputComponent
  ],
  // 2. IMPORTE os módulos do Angular que seus componentes precisam usar.
  imports: [
    BrowserModule, // Essencial, já importa o CommonModule por baixo dos panos, mas ser explícito não custa.
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  // 3. Especifique o componente raiz da aplicação.
  bootstrap: [AppComponent]
  // 4. A seção 'exports' não é necessária aqui, pois não estamos criando uma biblioteca
  // de componentes para ser importada por outros módulos. O BrowserModule já lida com o que é preciso.
  // O erro anterior era de fato um erro de digitação que corrigimos.
})
export class AppModule { }