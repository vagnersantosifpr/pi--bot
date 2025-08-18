import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// (Defina as interfaces para os dados aqui para ter um código mais tipado e seguro)
export interface ConversationSnippet {
    _id: string;
    userId: string;
    createdAt: string;
    messages: [{ text: string }];
}

export interface KnowledgeItem {
    _id: string;
    topic: string;
    content: string;
    source: string;
}

// ... outras interfaces

@Injectable({
    providedIn: 'root'
})
export class AdminApiService {
    //    private apiUrl = 'http://localhost:3000/api/admin'; // Ou URL de produção
    private readonly apiUrl = 'https://pia-bot.onrender.com/api/admin';

    constructor(private http: HttpClient) { }

    // --- Métodos de Conversa ---
    getConversationSnippets(): Observable<ConversationSnippet[]> {
        return this.http.get<ConversationSnippet[]>(`${this.apiUrl}/conversations`);
    }

    getConversationById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/conversations/${id}`);
    }

    // --- Métodos de Base de Conhecimento ---
    getKnowledgeBase(): Observable<KnowledgeItem[]> {
        return this.http.get<KnowledgeItem[]>(`${this.apiUrl}/knowledge`);
    }

    deleteKnowledgeItem(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/knowledge/${id}`);
    }
    // --- ADICIONE O MÉTODO FALTANTE AQUI ---
    createKnowledgeItem(item: { source: string; topic: string; content: string }): Observable<KnowledgeItem> {
        return this.http.post<KnowledgeItem>(`${this.apiUrl}/knowledge`, item);
    }

    // --- Métodos de Usuário (a serem implementados depois) ---
    // getUsers(): Observable<any[]> { ... }
    // createUser(user: any): Observable<any> { ... }
}