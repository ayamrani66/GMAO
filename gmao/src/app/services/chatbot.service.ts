// chatbot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FileContent {
  name: string;
  content: string;
}

export interface ChatRequest {
  question: string;
  history: ConversationMessage[];
  fileContents?: FileContent[];
}

export interface ChatResponse {
  answer: string;
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {

  private readonly BACKEND_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token')
        || localStorage.getItem('jwt')
        || localStorage.getItem('access_token')
        || sessionStorage.getItem('token')
        || null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : new HttpHeaders();
  }

  sendMessage(
    question: string,
    history: ConversationMessage[],
    fileContents?: FileContent[]
  ): Observable<ChatResponse> {
    const body: ChatRequest = { question, history, fileContents };
    return this.http.post<ChatResponse>(
      `${this.BACKEND_URL}/chatbot/message`,
      body,
      { headers: this.getHeaders() }
    );
  }

  // Lit un fichier texte/CSV/JSON et retourne son contenu
  readFileAsText(file: File): Promise<FileContent> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          name: file.name,
          content: (e.target?.result as string) || ''
        });
      };
      reader.onerror = () => reject(new Error(`Erreur lecture ${file.name}`));
      reader.readAsText(file, 'utf-8');
    });
  }
}