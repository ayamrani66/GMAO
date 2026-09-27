import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-ot-correctif-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ot-correctif-detail.component.html',
  styleUrls: ['./ot-correctif-detail.component.css']
})
export class OtCorrectifDetailComponent implements OnInit {

  ot: any = null;
  loading = true;
  saving = false;
  saved = false;

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
    public roleService: RoleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOT(+id);
      this.loadPDR();
    }
  }

  // ── Chargement ──

  loadOT(id: number): void {
  this.loading = true;
  this.http.get(`${this.apiBase}/ot/${id}`, { headers: this.authHeaders() }).subscribe({
    next: (data: any) => {
      console.log('Données OT reçues:', data); // Pour déboguer
      this.ot = data;
      this.syncFeedback();
      this.saved = !!(data.dateDebutIntervention || data.dateFinIntervention || 
                    (data.actions && data.actions.length > 0));
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur lors du chargement de l\'OT', err);
      this.loading = false;
      this.ot = null; // Assurez-vous que ot est null pour afficher l'erreur
      if (err.status === 403) alert("Session expirée ou accès refusé.");
    }
  });
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
  if (!this.ot) return;

  this.feedback.statut = this.ot.statut;
  this.feedback.dateDebutIntervention = this.formatDateForInput(this.ot.dateDebutIntervention);
  this.feedback.dateFinIntervention   = this.formatDateForInput(this.ot.dateFinIntervention);
  
  // Mapping sécurisé des pièces consommées
  this.feedback.piecesConsommees = (this.ot.piecesConsommees || []).map((p: any) => ({
    pieceRechangeId: p.pieceRechange?.id ?? p.pieceRechangeId,
    quantiteConsommee: p.quantiteConsommee
  }));

  // Extraction propre des actions (s'assure qu'on extrait des chaînes de caractères)
  if (this.ot.actions) {
    this.feedback.actions = this.ot.actions.map((act: any) => 
      typeof act === 'object' ? act.libelle || act.description : act
    );
  } else {
    this.feedback.actions = [];
  }
}

  enableEdit(): void {
    this.saved = false;
  }

  // ── Rôle ──

  getUserRole(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch { return ''; }
  }

  isResponsable(): boolean {
    return this.getUserRole() === 'RESPONSABLE';
  }

  isCloture(): boolean {
    return this.ot?.statut === 'Cloture';
  }

  isEditable(): boolean {
    return !(this.isCloture() && !this.isResponsable());
  }

  // ── Statuts disponibles ──

  getStatutsDisponibles(): string[] {
    if (this.isCloture()) return ['Cloture'];
    const base = ['Cree', 'En_cours_planification', 'Planifie',
                  'En_cours_preparation', 'Prepare', 'Termine'];
    if (this.isResponsable()) base.push('Cloture');
    return base;
  }

  // Termine désactivé si pas de date de fin
  isStatutTermineDisabled(): boolean {
    return this.feedback.statut === 'Termine' && !this.feedback.dateFinIntervention;
  }

  canSubmit(): boolean {
    if (this.feedback.statut === 'Termine' && !this.feedback.dateFinIntervention) return false;
    return true;
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
            .catch(async (err) => {
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
  // 1. On s'assure d'utiliser responseType: 'blob'
  this.http.get(`${this.apiBase}/ot/${this.ot.id}/pdf`, {
    headers: this.authHeaders(),
    responseType: 'blob' 
  }).subscribe({
    next: (blob: Blob) => {
      // 2. Création de l'URL sécurisée pour le PDF
      const url = window.URL.createObjectURL(blob);
      
      // 3. Ouverture dans un nouvel onglet
      const win = window.open(url, '_blank');
      
      // Optionnel : Libérer la mémoire après un certain temps
      if (win) {
        win.onload = () => window.URL.revokeObjectURL(url);
      }
    },
    error: (err) => {
      console.error("Erreur PDF:", err);
      alert("Impossible de générer le PDF. Vérifiez que le serveur est démarré.");
    }
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
      ELECMEC: 'Électromécanicien', AUTO: 'Automaticien', INSPE: 'Inspecteur',
      INSMEC: 'Inspecteur mécanique', EXEC: 'Exécutant', CHAUD: 'Chaudronnier',
      INSTR: 'Instrumentiste', TUY: 'Tuyautier', PROD: 'Production',
      INSHYD: 'Inspecteur hydraulique'
    };
    return map[r] || r;
  }

  formatNature(n: string): string {
    const map: Record<string, string> = {
      Mecanique: 'Mécanique', Hydraulique: 'Hydraulique',
      Electrique: 'Électrique', Thermique: 'Thermique',
      Chaudronnerie: 'Chaudronnerie', Pnematique: 'Pneumatique',
      Inspection: 'Inspection', Graissage: 'Graissage', Instrumentation: 'Instrumentation',
      Automatisme: 'Automatisme', Autre: 'Autre',Lubrification: 'Lubrification'
    };
    return map[n] ?? n ?? '—';
  }

  isPreventif(): boolean { return this.ot?.typeOT === 'Preventif'; }

  goBack(): void { this.router.navigate(['/ot']); }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }
}