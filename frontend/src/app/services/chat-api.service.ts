// src/app/services/chat-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a interface para a resposta da API
export interface ChatResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  // URL do nosso backend. Lembre-se que ele está rodando na porta 3000.
  private readonly apiUrl = 'https://pia-bot.onrender.com/api/chat';
  //private readonly apiUrl = 'http://localhost:3000/api/chat';

  constructor(private http: HttpClient) { }

  sendMessage(userId: string, message: string): Observable<ChatResponse> {
    const body = { userId, message };
    return this.http.post<ChatResponse>(this.apiUrl, body);
  }
}