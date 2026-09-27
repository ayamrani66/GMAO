import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class FileUploadComponent implements OnInit, OnChanges {

  @Input() diId?:         number;
  @Input() otId?:         number;
  @Input() equipementId?: number;
  @Input() readonly      = false;

  documents:    any[]  = [];
  pendingFiles: File[] = [];
  isDragging  = false;
  uploading   = false;
  lightboxUrl: string | null = null;

  private initDone = false;  // ← garde pour éviter double chargement

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.initDone = true;
    this.loadDocuments();   // charge si l'id est déjà là (mode édition)
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Avant ngOnInit : laisser ngOnInit s'en charger
    if (!this.initDone) return;

    const idChange = changes['diId'] || changes['otId'] || changes['equipementId'];
    if (!idChange) return;

    const prev = idChange.previousValue;
    const curr = idChange.currentValue;

    // Nouvel id valide → flush pending + rechargement
    if (curr && curr > 0) {
      this.flushPendingFiles();
      this.loadDocuments();
    }
    // Id supprimé (passage de valeur → undefined) → vider la liste
    else if (!curr && prev) {
      this.documents = [];
    }
  }

  private hasId(): boolean {
    return (!!this.diId         && this.diId         > 0) ||
           (!!this.otId         && this.otId         > 0) ||
           (!!this.equipementId && this.equipementId > 0);
  }

  loadDocuments(): void {
    if (!this.hasId()) return;

    const obs = this.diId         ? this.documentService.getByDi(this.diId!)
              : this.otId         ? this.documentService.getByOt(this.otId!)
              : this.equipementId ? this.documentService.getByEquipement(this.equipementId!)
              : null;

    obs?.subscribe(docs => {
      // Ne remplacer la liste que par les docs déjà uploadés (pas les pending)
      const pending = this.documents.filter(d => d._pending);
      this.documents = [...docs, ...pending];
    });
  }

  flushPendingFiles(): void {
    if (!this.pendingFiles.length) return;
    const files = [...this.pendingFiles];
    this.pendingFiles = [];
    files.forEach(f => this.uploadFile(f));
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.uploadFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.isDragging = true; }
  onDragLeave(): void                { this.isDragging = false; }

  uploadFile(file: File): void {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      alert('Seuls les fichiers PDF et images sont acceptés.');
      return;
    }

    if (!this.hasId()) {
      // Pas encore d'id → mise en attente + aperçu local
      this.pendingFiles.push(file);
      this.documents.push({
        nomFichier: file.name,
        type:       file.type,
        _localUrl:  URL.createObjectURL(file),
        _pending:   true
      });
      return;
    }

    this.uploading = true;
    this.documentService.upload(file, {
      diId:         this.diId,
      otId:         this.otId,
      equipementId: this.equipementId
    }).subscribe({
      next: () => { this.uploading = false; this.loadDocuments(); },
      error: ()  => { this.uploading = false; alert('Erreur lors du téléchargement.'); }
    });
  }

  deleteDocument(doc: any): void {
    if (doc._pending) {
      this.pendingFiles = this.pendingFiles.filter(f => f.name !== doc.nomFichier);
      this.documents    = this.documents.filter(d => d !== doc);
      return;
    }
    if (!confirm(`Supprimer "${doc.nomFichier}" ?`)) return;
    this.documentService.delete(doc.id).subscribe({
      next:  () => this.documents = this.documents.filter(d => d.id !== doc.id),
      error: ()  => alert('Erreur lors de la suppression.')
    });
  }

  openLightbox(doc: any): void {
    this.lightboxUrl = doc._pending
      ? doc._localUrl
      : this.documentService.getViewUrl(doc.id);
  }

  getViewUrl(doc: any): string {
    return doc._pending
      ? doc._localUrl
      : this.documentService.getViewUrl(doc.id);
  }

  getDownloadUrl(doc: any): string {
    return this.documentService.getDownloadUrl(doc.nomFichier);
  }

  isImage(type: string): boolean  { return type?.startsWith('image/'); }

  getFileIcon(type: string): string {
    if (type?.includes('pdf'))      return '📄';
    if (type?.startsWith('image/')) return '🖼️';
    return '📎';
  }
}