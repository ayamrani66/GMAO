import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OtService } from '../../services/ot.service';

@Component({
  selector: 'app-ot-preventif-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ot-preventif-detail.component.html',
  styleUrls: ['./ot-preventif-detail.component.css']
})
export class OtPreventifDetailComponent implements OnInit {

  ot: any = null;
  otId: number | null = null; 
  loading = true;
  saving = false;
  saved = false;

  checklist: any[] = []; // { id, operation: { id, action, equipement, sousEquipement, ... }, estFaite }
  togglingId: number | null = null;

  filteredChecklist: any[] = [];
  searchTerm: string = '';

  pdrList: any[] = [];
  selectedFiles: File[] = [];
  actionInput = '';
  isDragOver = false;
  lightboxDoc: string | null = null;

  feedback = {
    dateDebutIntervention: '',
    dateFinIntervention: '',
    statut: '',
    piecesConsommees: [] as { pieceRechangeId: number | null, quantiteConsommee: number | null }[],
    actions: [] as string[]
  };

  newPdr: { pieceRechangeId: number | null, quantiteConsommee: number | null } = {
  pieceRechangeId: null,
  quantiteConsommee: null
};

filteredPdrList: any[] = [];

  private apiBase = 'http://localhost:8080/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
     private otService: OtService 
  ) {}

  ngOnInit(): void {
    const idStr  = this.route.snapshot.paramMap.get('id');
    this.route.queryParams.subscribe(params => {
    this.searchTerm = params['filter'] || '';
  });

  if (idStr) {
    this.otId = +idStr;
    this.loadOT(this.otId);
    this.loadPDR();
  }
  }

  // ── Chargement ──

  loadOT(id: number): void {
  this.loading = true;
  this.http.get(`${this.apiBase}/ot/${id}`, { headers: this.authHeaders() }).subscribe({
    next: (data: any) => {
      this.ot = data;
      
      // Extraction de la checklist directement depuis l'OT reçu
      this.checklist = data.checklist || [];
      this.applyFilterToChecklist(); // Met à jour filteredChecklist pour le tableau
      
      this.syncFeedback();
      this.saved = !!(
        data.dateDebutIntervention ||
        data.dateFinIntervention   ||
        (data.actions && data.actions.length > 0) ||
        data.statut !== 'Cree'
      );
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur chargement OT:', err);
      this.loading = false;
    }
  });
}

loadChecklist(): void {
  if (!this.otId) return;
  this.otService.getChecklist(this.otId).subscribe({
    next: (data) => {
      this.checklist = data;
      this.applyFilterToChecklist(); // <--- Appliquer le filtre ici
    },
    error: (err) => console.error('Erreur checklist:', err)
  });
}

applyFilterToChecklist(): void {
  if (!this.searchTerm) {
    this.filteredChecklist = this.checklist;
    return;
  }
  const s = this.searchTerm.toLowerCase();
  this.filteredChecklist = this.checklist.filter(ligne => 
    ligne.operation.equipement?.toLowerCase().includes(s) ||
    ligne.operation.sousEquipement?.toLowerCase().includes(s) ||
    ligne.operation.action?.toLowerCase().includes(s)
  );
}

toggleFaite(ligne: any): void {
  if (!this.isEditable() || !this.otId) return; // Vérification otId
  
  const newVal = !ligne.estFaite;
  this.togglingId = ligne.id;
  
  this.otService.toggleOperation(this.otId, ligne.operation.id, newVal).subscribe({
    next: (updated) => {
      ligne.estFaite = updated.estFaite;
      this.togglingId = null;
    },
    error: () => this.togglingId = null
  });
}

getProgression(): { faites: number; total: number; pct: number } {
  const total = this.checklist.length;
  const faites = this.checklist.filter(l => l.estFaite).length;
  return { faites, total, pct: total ? Math.round((faites / total) * 100) : 0 };
}

  loadPDR(): void {
  this.http.get(`${this.apiBase}/pieces-rechange`, { headers: this.authHeaders() })
    .subscribe({
      next: (data: any) => {
        this.pdrList = data;

        this.filteredPdrList = this.pdrList.filter(
          (p: any) => p.stockActuel >= p.stockMin
        );
      }
    });
}

  syncFeedback(): void {
    this.feedback.statut                = this.ot.statut;
    this.feedback.dateDebutIntervention = this.formatDateForInput(this.ot.dateDebutIntervention);
    this.feedback.dateFinIntervention   = this.formatDateForInput(this.ot.dateFinIntervention);
    this.feedback.actions               = [...(this.ot.actions || [])];
    this.feedback.piecesConsommees = (this.ot.piecesConsommees || []).map((p: any) => ({
    pieceRechangeId: p.pieceRechange?.id ?? p.pieceRechangeId,
    quantiteConsommee: p.quantiteConsommee
  }));
  }

  enableEdit(): void { this.saved = false; }

  // ── Rôle ──

  getUserRole(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch { return ''; }
  }

  isResponsable(): boolean { return this.getUserRole() === 'RESPONSABLE'; }
  isCloture(): boolean     { return this.ot?.statut === 'Cloture'; }
  isEditable(): boolean {
  if (!this.ot) return false;
  return !(this.isCloture() && !this.isResponsable());
}

  // ── Statuts ──

  getStatutsDisponibles(): string[] {
  if (this.isCloture()) return ['Cloture'];

  const base = ['Cree', 'En_cours_planification', 'Planifie',
                'En_cours_preparation', 'Prepare'];

  // "Terminé" n'apparaît que si la date de fin est renseignée
  if (this.feedback.dateFinIntervention) {
    base.push('Termine');
  }

  // "Clôturé" n'apparaît que si l'OT est déjà au statut Terminé (et seulement pour le Responsable)
  if (this.isResponsable() && this.ot?.statut === 'Termine') {
    base.push('Cloture');
  }

  return base;
}

  canSubmit(): boolean {
    if (this.feedback.statut === 'Termine' && !this.feedback.dateFinIntervention) return false;
    return true;
  }
  isGammeGraissage(): boolean {
  return !!this.ot?.gamme?.descriptionGamme?.toUpperCase().includes('GRA');
}

  // ── Soumission ──

  submitFeedback(): void {
    if (!this.canSubmit()) {
      alert('Pour passer au statut Terminé, renseignez la date de fin d\'intervention.');
      return;
    }

    this.saving = true;

    const formatDate = (d: string) => d ? (d.length === 16 ? d + ':00' : d) : null;

    const payload = {
      dateDebutIntervention: formatDate(this.feedback.dateDebutIntervention),
      dateFinIntervention:   formatDate(this.feedback.dateFinIntervention),
      statut:                this.feedback.statut,
      piecesConsommees:      this.feedback.piecesConsommees,
      actions:               [...this.feedback.actions]
    };

    this.http.patch(`${this.apiBase}/ot/${this.ot.id}/feedback`, payload, {
      headers: this.authHeaders()
    }).subscribe({
      next: () => {
        if (this.selectedFiles.length > 0) {
          this.uploadFilesSequential()
            .then(() => {
              this.saving = false;
              this.selectedFiles = [];
              this.saved = true;
              this.loadOT(this.ot.id);
            })
            .catch((err) => {
              this.saving = false;
              console.error('Upload error:', err);
              this.saved = true;
              this.loadOT(this.ot.id);
            });
        } else {
          this.saving = false;
          this.saved = true;
          this.loadOT(this.ot.id);
        }
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message || err?.error || 'Erreur inconnue';
        console.error('Feedback error:', err);
        alert('Erreur : ' + msg);
      }
    });
  }

  // ── Upload ──

  async uploadFilesSequential(): Promise<void> {
    for (const file of this.selectedFiles) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('typeDocument', 'OT_RESIGNE');
      fd.append('otId', String(this.ot.id));

      const token = localStorage.getItem('token');
      console.log('Uploading:', file.name, '| otId:', this.ot.id, '| token:', !!token);

      const response = await fetch(`${this.apiBase}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upload failed [${response.status}]:`, errorText);
        throw new Error(`${response.status}: ${errorText}`);
      }
    }
  }

  printOT(): void {
    this.http.get(`${this.apiBase}/ot/${this.ot.id}/pdf`, {
      headers: this.authHeaders(),
      responseType: 'blob' as 'json'
    }).subscribe((res: any) => {
      window.open(URL.createObjectURL(new Blob([res], { type: 'application/pdf' })), '_blank');
    });
  }

  // ── Actions ──

  addAction(): void {
    const trimmed = this.actionInput.trim();
    if (trimmed) {
      this.feedback.actions = [...this.feedback.actions, trimmed];
      this.actionInput = '';
    }
  }

  removeAction(i: number): void {
    this.feedback.actions = this.feedback.actions.filter((_, idx) => idx !== i);
  }

  // ── Documents ──

  isImage(filename: string): boolean {
    return !!filename && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);
  }

  getDocUrl(doc: any): string {
    return `${this.apiBase}/documents/${doc.id}/file?token=${localStorage.getItem('token')}`;
  }

  openDocument(doc: any): void {
    if (this.isImage(doc.nomFichier)) this.lightboxDoc = this.getDocUrl(doc);
    else window.open(this.getDocUrl(doc), '_blank');
  }

  closeLightbox(): void { this.lightboxDoc = null; }

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragOver = true; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = false;
    if (e.dataTransfer?.files)
      this.selectedFiles.push(...Array.from(e.dataTransfer.files));
  }

  onFileSelect(e: any): void {
    this.selectedFiles.push(...Array.from(e.target.files as FileList));
  }

  removeFile(i: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, idx) => idx !== i);
  }

  // ── Formatage ──

  getPdrLabel(): string {
    if (!this.feedback.piecesConsommees.length) return '—';
    const p = this.pdrList.find(x => x.id === this.feedback.piecesConsommees[0].pieceRechangeId);
    return p ? `${p.code} — ${p.nom}` : '—';
  }

  addPdr(): void {
  if (!this.newPdr.pieceRechangeId || !this.newPdr.quantiteConsommee) return;
  this.feedback.piecesConsommees = [
    ...this.feedback.piecesConsommees,
    { ...this.newPdr }
  ];
  this.newPdr = { pieceRechangeId: null, quantiteConsommee: null };
}

removePdr(i: number): void {
  this.feedback.piecesConsommees = this.feedback.piecesConsommees.filter((_, idx) => idx !== i);
}

getPdrNom(id: number | null): string {
  if (!id) return '—';
  const p = this.pdrList.find(x => x.id === id);
  return p ? `${p.code} — ${p.nom}` : '—';
}
  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatDateDisplay(d: string): string {
    
    if (!d) return '—';
    const [date, time] = d.split('T');
    if (!date) return d;
    const [y, m, day] = date.split('-');
    return `${day}/${m}/${y}${time ? ' ' + time : ''}`;
  }

  formatDateForInput(d: string): string {
    return d ? d.substring(0, 16) : '';
  }

  formatStatut(s: string): string {
    const map: Record<string, string> = {
      Cree: 'Créé',
      En_cours_planification: 'En cours de planification',
      Planifie: 'Planifié',
      En_cours_preparation: 'En cours de préparation',
      Prepare: 'Préparé',
      Termine: 'Terminé',
      Cloture: 'Clôturé'
    };
    return map[s] || s;
  }

  formatRole(r: string): string {
    if (!r) return '—';
    const map: Record<string, string> = {
      GRA: 'Graisseur', MEC: 'Mécanicien', ELEC: 'Électricien',
      HYDR: 'Hydraulicien', SOUD: 'Soudeur',
      ELECMEC: 'Électromécanicien', AUTO: 'Automaticien', INSPE: 'Inspecteur', INSMEC: 'Inspecteur mécanique',
      EXEC: 'Exécutant', CHAUD: 'Chaudronnier', INSTR: 'Instrumentiste', TUY: 'Tuyautier',
      PROD: 'Production', INSHYD: 'Inspecteur hydraulique'
    };
    return map[r] || r;
  }

  formatNature(n: string): string {
    const map: Record<string, string> = {
      Mecanique: 'Mécanique', Hydraulique: 'Hydraulique',
      Electrique: 'Électrique', Thermique: 'Thermique',
      Chaudronnerie: 'Chaudronnerie', Pnematique: 'Pneumatique',
      Inspection: 'Inspection', Graissage: 'Graissage',Instrumentation: 'Instrumentation'
    };
    return map[n] ?? n ?? '—';
  }

  goBack(): void { this.router.navigate(['/ot-preventif']); }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }
  togglingActionId: number | null = null;

toggleActionFaite(action: any): void {
  if (!this.isEditable() || !this.otId) return;
  const newVal = !action.estFaite;
  this.togglingActionId = action.id;

  this.otService.toggleActionOT(this.otId, action.id, newVal).subscribe({
    next: (updated) => {
      action.estFaite = updated.estFaite;
      this.togglingActionId = null;
    },
    error: () => this.togglingActionId = null
  });
}

getProgressionActions(): { faites: number; total: number; pct: number } {
  const total = this.ot?.actionsStructurees?.length ?? 0;
  const faites = this.ot?.actionsStructurees?.filter((a: any) => a.estFaite).length ?? 0;
  return { faites, total, pct: total ? Math.round((faites / total) * 100) : 0 };
}
// Mettre toutes les lignes de la checklist à 'Faite'
checkAllChecklist(): void {
  if (!this.isEditable() || !this.otId || !this.filteredChecklist.length) return;

  // Filtrer celles qui ne sont pas encore faites pour éviter les appels API inutiles
  const nonFaites = this.filteredChecklist.filter(l => !l.estFaite);
  
  if (nonFaites.length === 0) return;

  nonFaites.forEach(ligne => {
    this.otService.toggleOperation(this.otId!, ligne.operation.id, true).subscribe({
      next: (updated) => {
        ligne.estFaite = updated.estFaite;
      },
      error: (err) => console.error("Erreur lors de la coche globale", err)
    });
  });
}

// Mettre toutes les actions de l'OT correctif à 'Faite'
checkAllActions(): void {
  if (!this.isEditable() || !this.otId || !this.ot?.actionsStructurees?.length) return;

  const nonFaites = this.ot.actionsStructurees.filter((a: any) => !a.estFaite);
  
  if (nonFaites.length === 0) return;

  nonFaites.forEach((action: any) => {
    this.otService.toggleActionOT(this.otId!, action.id, true).subscribe({
      next: (updated) => {
        action.estFaite = updated.estFaite;
      },
      error: (err) => console.error("Erreur lors de la coche globale des actions", err)
    });
  });
}
}