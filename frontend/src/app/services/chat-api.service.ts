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

  sendMessage1(userId: string, message: string, piabot_temperature: number): Observable<ChatResponse> {
    const body = { userId, message, piabot_temperature };
    return this.http.post<ChatResponse>(this.apiUrl, body);
  }

  async sendMessage(userId: string, message: string, temperature: number): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message, piabot_temperature: temperature })
    });

    if (!response.ok) {
      throw new Error('Falha na requisição da API');
    }

    // A CORREÇÃO ESTÁ AQUI: espere o JSON ser parseado
    const data = await response.json();
    return data;
  }
}