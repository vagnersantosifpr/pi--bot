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
  private readonly apiUrl = 'https://pia-bot.onrender.com/api/chat';

  constructor(private http: HttpClient) { }

  sendMessage(userId: string, message: string, temperature: number): Observable<ChatResponse> {
    const body = { userId, message, piabot_temperature: temperature };
    return this.http.post<ChatResponse>(this.apiUrl, body);
  }
}