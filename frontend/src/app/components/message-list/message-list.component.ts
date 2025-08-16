// src/app/components/message-list/message-list.component.ts
import { Component, Input, ViewChild, ElementRef, AfterViewChecked, QueryList, ViewChildren, SimpleChanges, OnChanges } from '@angular/core';

import { Message } from '../../message.model';
import { CommonModule } from '@angular/common'; // <-- IMPORTAR
import { MessageItemComponent } from '../message-item/message-item.component'; // <-- IMPORTAR
import { MarkdownModule } from 'ngx-markdown'; // Verifique se precisa disso para o próximo passo

@Component({
  selector: 'app-message-list',
  //standalone: true, // <-- ESSENCIAL
  //imports: [CommonModule, MessageItemComponent, MarkdownModule], // Adicionado MarkdownModule aqui também
  imports: [CommonModule, MessageItemComponent, MarkdownModule], // Adicionado MarkdownModule aqui também
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})

export class MessageListComponent implements AfterViewChecked {
  // Recebe o array de mensagens do componente pai
  @Input() messages: Message[] = [];

  // Obtém a referência do container de scroll que definimos no HTML
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Obtém uma referência a TODOS os componentes de item de mensagem
  @ViewChildren(MessageItemComponent) private messageItems!: QueryList<MessageItemComponent>;

  private mutationObserver!: MutationObserver;


  ngOnChanges(changes: SimpleChanges): void {
    // Se a propriedade 'messages' mudar, chamamos o método de rolagem.
    // Isso garante que mesmo as mudanças iniciais acionem a rolagem.
    if (changes['messages']) {
      this.scrollToBottom();
    }
  }

  // Este método é chamado toda vez que a view é checada.
  // Usamos para rolar para a última mensagem.
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngAfterViewInit(): void {
    // ngAfterViewInit é o local ideal, pois o elemento já está renderizado na tela.
    this.observeContainerChanges();
    this.scrollToBottom(); // Rola para baixo na inicialização
  }

  ngOnDestroy(): void {
    // É importante desconectar o observer para evitar vazamentos de memória.
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  private observeContainerChanges(): void {
    // O MutationObserver é mais eficiente do que verificar a cada ciclo de detecção de mudanças.
    // Ele nos notifica sempre que a lista de filhos do contêiner (nossas mensagens) muda.
    this.mutationObserver = new MutationObserver((mutations) => {
      this.scrollToBottom();
    });

    // Configura o observer para observar a adição ou remoção de elementos filhos.
    this.mutationObserver.observe(this.scrollContainer.nativeElement, {
      childList: true
    });
  }
  private scrollToBottom(): void {
    // A MUDANÇA ESTÁ AQUI
    setTimeout(() => {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Erro ao rolar para o final:', err);
      }
    }, 0); // O delay de 0ms é a chave!
  }
}