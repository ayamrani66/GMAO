// chatbot.component.ts
import {
  Component, OnInit, AfterViewChecked,
  ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ConversationMessage, FileContent } from '../../services/chatbot.service';
import { AuthService } from '../../services/auth.service';          // ← adapter le chemin
import { FormatContentPipe } from './format-content.pipe';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
  files?: string[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatContentPipe],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('inputField')        inputField!: ElementRef;
  @ViewChild('fileInput')         fileInput!: ElementRef;

  messages: ChatMessage[]       = [];
  inputText                     = '';
  isOpen                        = false;
  isLoading                     = false;
  unreadCount                   = 0;
  attachedFiles: FileContent[]  = [];
  attachedFileNames: string[]   = [];
  isAuthenticated               = false;

  private history: ConversationMessage[] = [];
  private shouldScroll = false;

  quickSuggestions = [
    '📊 Résumé global de la maintenance',
    '⏰ OTs en retard cette semaine',
    '🔧 Répartition OTs correctifs / préventifs',
    '📋 DIs en attente de validation',
    '🏭 Équipements les plus sollicités',
    '📦 Pièces de rechange à faible stock',
  ];

  constructor(
    private chatbotService: ChatbotService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Vérifier l'authentification via getCurrentUser() (token localStorage)
    const user = this.authService.getCurrentUser();
    this.isAuthenticated = !!user;

    if (this.isAuthenticated) {
      this.initWelcomeMessage(user);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private initWelcomeMessage(user?: any): void {
    const hour     = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const prenom   = user?.nomComplet?.split(' ')?.[0] ?? '';
    const salut    = prenom ? `${greeting}, **${prenom}**` : greeting;

    this.messages = [{
      role: 'assistant',
      content: `👋 ${salut} ! Je suis votre Assistant GMAO SOMASTEEL.\n\nJe peux analyser vos **OTs**, **DIs**, **équipements** et **PDR** en temps réel. Posez-moi n'importe quelle question sur vos données de maintenance ou choisissez une suggestion ci-dessous.`,
      timestamp: new Date()
    }];
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.inputField?.nativeElement?.focus(), 150);
    }
  }

  // ── Auto-resize textarea ────────────────────────────────────────────────
  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }

  // ── Gestion des fichiers ────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(async (file) => {
      if (file.size > 500 * 1024) {
        alert(`⚠️ Fichier trop volumineux : ${file.name} (max 500 Ko)`);
        return;
      }
      try {
        const fc = await this.chatbotService.readFileAsText(file);
        this.attachedFiles.push(fc);
        this.attachedFileNames.push(file.name);
        this.cdr.detectChanges();
      } catch (e) {
        console.error('Erreur lecture fichier', e);
      }
    });
    input.value = '';
  }

  removeFile(index: number): void {
    this.attachedFiles.splice(index, 1);
    this.attachedFileNames.splice(index, 1);
  }

  // ── Envoi du message ────────────────────────────────────────────────────
  sendMessage(text?: string): void {
    const question = (text || this.inputText).trim();
    if (!question || this.isLoading) return;

    const filesToSend = [...this.attachedFiles];
    const fileNames   = [...this.attachedFileNames];

    this.inputText        = '';
    this.attachedFiles    = [];
    this.attachedFileNames = [];

    // Reset textarea height
    if (this.inputField?.nativeElement) {
      this.inputField.nativeElement.style.height = 'auto';
    }

    this.messages.push({
      role: 'user',
      content: question,
      timestamp: new Date(),
      files: fileNames.length > 0 ? fileNames : undefined
    });

    const loadingMsg: ChatMessage = {
      role: 'assistant', content: '', timestamp: new Date(), loading: true
    };
    this.messages.push(loadingMsg);
    this.isLoading     = true;
    this.shouldScroll  = true;
    this.cdr.detectChanges();

    // Enrichir la question avec le contexte utilisateur (rôle)
    // Le backend Spring Boot gère le systemPrompt — on passe juste le contexte dans la question
    const user        = this.authService.getCurrentUser();
    const roleCtx     = user ? `[Rôle: ${user.role}${user.roleTechnicien ? ' / ' + user.roleTechnicien : ''}] ` : '';
    const questionWithCtx = roleCtx + question;

    this.chatbotService
      .sendMessage(questionWithCtx, this.history, filesToSend)
      .subscribe({
        next: (response) => {
          const idx     = this.messages.indexOf(loadingMsg);
          const content = response.success ? response.answer : `❌ ${response.error}`;

          if (idx !== -1) {
            this.messages[idx] = { role: 'assistant', content, timestamp: new Date() };
          }

          if (response.success) {
            this.history.push({ role: 'user',      content: question });
            this.history.push({ role: 'assistant', content: response.answer });

            // Limiter l'historique à 20 échanges (10 tours)
            if (this.history.length > 20) {
              this.history = this.history.slice(this.history.length - 20);
            }
          }

          if (!this.isOpen) this.unreadCount++;
          this.isLoading    = false;
          this.shouldScroll = true;
          this.cdr.detectChanges();
        },
        error: () => {
          const idx = this.messages.indexOf(loadingMsg);
          if (idx !== -1) {
            this.messages[idx] = {
              role: 'assistant',
              content: '❌ **Impossible de joindre le serveur.** Vérifiez votre connexion et réessayez.',
              timestamp: new Date()
            };
          }
          this.isLoading    = false;
          this.shouldScroll = true;
          this.cdr.detectChanges();
        }
      });
  }

  useSuggestion(s: string): void {
    // Supprimer l'émoji en tête si présent
    const clean = s.replace(/^[\p{Emoji}\s]+/u, '').trim();
    this.sendMessage(clean);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearConversation(): void {
    this.history           = [];
    this.attachedFiles     = [];
    this.attachedFileNames = [];
    this.initWelcomeMessage(this.authService.getCurrentUser());
  }

  formatTime(d: Date): string {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}