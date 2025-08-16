// src/app/message.model.ts
export interface Message {
  role: 'user' | 'model' | 'loading'; // Adicionamos 'loading' para o indicador
  text: string;
}