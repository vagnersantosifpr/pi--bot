import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Crie um novo tipo para o payload de atualização
// Este tipo inclui campos gerais que podem ser atualizados
// E também os campos específicos para a alteração de senha
export type UserUpdatePayload = {
    name?: string;
    role?: 'admin' | 'viewer'; // Opcional, apenas para admins que mudam o role de outros

    // Campos específicos para alteração de senha
    currentPassword?: string;
    newPassword?: string;
};

// (Defina as interfaces para os dados aqui para ter um código mais tipado e seguro)
export interface ConversationSnippet {
    _id: string;
    userId: string;
    createdAt: string;
    messages: [{ text: string }];
}

// NOVA INTERFACE PARA O MODELO DE USUÁRIO
export interface User {
    _id: string;
    email: string;
    name: string;
    role: 'admin' | 'viewer'; // Ou os roles que você usa
    createdAt: string;
    // Não inclua 'password' aqui para segurança
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

    // --- NOVOS MÉTODOS DE USUÁRIO ---
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    createUser(userData: { email: string; password: string; name: string; role: string }): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/users`, userData);
    }

    updateUser(id: string, updateData: UserUpdatePayload): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/users/${id}`, updateData);
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${id}`);
    }

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