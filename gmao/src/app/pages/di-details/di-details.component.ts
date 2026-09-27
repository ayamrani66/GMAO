import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiService } from '../../services/di.service';
import { OtService } from '../../services/ot.service';
import { RoleService } from '../../services/role.service';
import { FileUploadComponent } from '../../modules/upload-file/upload-file.component';

@Component({
  selector: 'app-di-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent],
  templateUrl: './di-details.component.html',
  styleUrls: ['./di-details.component.css']
})
export class DiDetailsComponent implements OnInit {

  di: any = null;
  ot: any = null;
  loading = true;

  affectationLabels: Record<string, string> = {
    GRA: 'Graisseur', MEC: 'Mécanicien', ELEC: 'Électricien', HYDR: 'Hydraulicien',
    SOUD: 'Soudeur', ELECMEC: 'Électromécanicien', AUTO: 'Automaticien', INSPE: 'Inspecteur',
    INSMEC: 'Inspecteur mécanique', EXEC: 'Exécutant', CHAUD: 'Chaudronnier', INSTR: 'Instrumentiste',
    TUY: 'Tuyautier', PROD: 'Production', INSHYD: 'Inspecteur hydraulique'
  };

  rolesTechnicien = [
    { value: 'GRA', label: 'Graisseur' }, { value: 'MEC', label: 'Mécanicien' },
    { value: 'ELEC', label: 'Électricien' }, { value: 'HYDR', label: 'Hydraulicien' },
    { value: 'SOUD', label: 'Soudeur' }, { value: 'ELECMEC', label: 'Électromécanicien' },
    { value: 'AUTO', label: 'Automaticien' }, { value: 'INSPE', label: 'Inspecteur' },
    { value: 'INSMEC', label: 'Inspecteur mécanique' }, { value: 'EXEC', label: 'Exécutant' },
    { value: 'CHAUD', label: 'Chaudronnier' }, { value: 'INSTR', label: 'Instrumentiste' },
    { value: 'TUY', label: 'Tuyautier' }, { value: 'PROD', label: 'Production' },
    { value: 'INSHYD', label: 'Inspecteur hydraulique' }
  ];

  // ── Validation ──
  showValidationModal = false;
  affectationChoisie: string | null = null;
  titreOT = '';
  validationError = '';

  // ── Rejet ──
  showRejetModal = false;
  causeRejet = '';
  rejetError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diService: DiService,
    private otService: OtService,
    public roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.chargerDi();
  }

  chargerDi(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading = false; return; }
    this.loading = true;
    this.diService.getById(Number(id)).subscribe({
      next: (data) => {
        this.di = data;
        this.loading = false;
        if (this.di.statut === 'Validee') {
          this.chargerOTLie();
        }
      },
      error: () => { this.loading = false; }
    });
  }

  chargerOTLie(): void {
    this.otService.getByDiId(this.di.id).subscribe({
      next: (ot) => { this.ot = ot; },
      error: () => { this.ot = null; } // 404 → pas (encore) d'OT lié
    });
  }

  voirOT(): void {
    if (this.ot) {
      this.router.navigate(['/ot-correctif/details', this.ot.id]);
    }
  }

  getOtStatutClass(s: string): string {
    return ({
      'Cree':                   'badge-grey',
    'En_cours_planification': 'badge-blue',   
    'Planifie':               'badge-cyan',   
    'En_cours_preparation':   'badge-amber',  
    'Prepare':                'badge-indigo', 
    'Termine':                'badge-green',  
    'Cloture':                'badge-dark'
    } as any)[s] ?? 'badge-grey';
  }

  formatOtStatut(s: string): string {
    return ({
      Cree: 'Créé',
      En_cours_planification: 'En cours de planification',
      Planifie: 'Planifié',
      En_cours_preparation: 'En cours de préparation',
      Prepare: 'Préparé',
      Termine: 'Terminé',
      Cloture: 'Clôturé'
    } as any)[s] ?? s;
  }

  getPrioriteClass(p: string): string {
    return ({ Urgente: 'badge-red', Haute: 'badge-orange', Normale: 'badge-blue', Basse: 'badge-grey' } as any)[p] ?? 'badge-grey';
  }

  getStatutClass(s: string): string {
    return ({ Cree: 'badge-grey', Validee: 'badge-green', Rejetee: 'badge-red' } as any)[s] ?? 'badge-grey';
  }

  formatStatut(s: string): string {
    return ({ Cree: 'Créée', Validee: 'Validée', Rejetee: 'Rejetée' } as any)[s] ?? s;
  }

  retour(): void {
    this.router.navigate(['/di']);
  }

  // ── Validation ──
  ouvrirModalValidation(): void {
    this.affectationChoisie = null;
    this.titreOT = '';
    this.validationError = '';
    this.showValidationModal = true;
  }

  fermerModalValidation(): void {
    this.showValidationModal = false;
  }

  confirmerValidation(): void {
    if (!this.titreOT?.trim()) {
      this.validationError = "Le titre de l'OT est obligatoire.";
      return;
    }
    if (!this.affectationChoisie) {
      this.validationError = "Veuillez sélectionner une affectation technicien.";
      return;
    }
    this.validationError = '';
     this.diService.valider(this.di.id, this.affectationChoisie, this.titreOT).subscribe({
    next: (diMiseAJour) => { 
      this.di = diMiseAJour; // On met à jour l'objet DI localement avec le retour du serveur
      this.fermerModalValidation();
      
      // On attend un tout petit peu (100ms) pour laisser le temps au backend 
      // de finaliser la transaction de l'OT avant de le chercher
      setTimeout(() => {
        this.chargerOTLie();
      }, 200);
    },
    error: (err) => this.validationError = err?.error?.message || 'Erreur lors de la validation.'
  });
  }

  // ── Rejet ──
  ouvrirModalRejet(): void {
    this.causeRejet = '';
    this.rejetError = '';
    this.showRejetModal = true;
  }

  fermerModalRejet(): void {
    this.showRejetModal = false;
  }

  confirmerRejet(): void {
    if (!this.causeRejet?.trim()) {
      this.rejetError = 'Le motif du rejet est obligatoire.';
      return;
    }
    this.rejetError = '';
    this.diService.rejeter(this.di.id, this.causeRejet).subscribe({
      next: () => { this.fermerModalRejet(); this.chargerDi(); },
      error: (err) => this.rejetError = err?.error?.message || 'Erreur lors du rejet.'
    });
  }
}