import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DiService } from '../../services/di.service';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-di-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './di-list.component.html',
  styleUrls: ['./di-list.component.css']
})
export class DiListComponent implements OnInit {

  demandes: any[] = [];
  filtered: any[] = [];
  loading = false;
  titreOT = '';

  searchQuery  = '';
  filterStatut = 'all';

  filters = {
    equipement:  '',
    anomalie:    'all',
    affectation: 'all',   // ← aligné avec le HTML ([(ngModel)]="filters.affectation")
    priorite:    'all',
    statut:      'all',   // ← ajouté pour le filtre statut dans le thead
    date:        ''
  };

    affectationLabels: Record<string, string> = {
  GRA:     'Graisseur',
  MEC:     'Mécanicien',
  ELEC:    'Électricien',
  HYDR:    'Hydraulicien',
  SOUD:    'Soudeur',
  ELECMEC: 'Électromécanicien',
  AUTO:    'Automaticien',
  INSPE:   'Inspecteur',
  INSMEC:  'Inspecteur mécanique',
  EXEC:    'Exécutant',
  CHAUD:   'Chaudronnier',
  INSTR:   'Instrumentiste',
  TUY:     'Tuyautier',
  PROD:    'Production',
  INSHYD:  'Inspecteur hydraulique'

};

  toutesLesAnomalies = ['Mecanique','Hydraulique','Electrique','Thermique','Chaudronnerie','Pnematique','Inspection','Lubrification','Instrumentation','Automatisme','Graissage','Autre'];
  toutesLesAffectations = ['Graisseur','Mécanicien','Électricien','Hydraulicien','Inspecteur','Électromécanicien','Soudeur','Automaticien','Chaudronnier','Instrumentiste','Tuyautier','Production','Inspecteur hydraulique','Inspecteur mécanique','Exécutant']; 
  toutesLesPriorites = ['Urgente','Haute','Normale','Basse'];
  toutesLesStatuts   = ['Cree','Validee','Rejetee'];              

  // ── Validation ──
  showValidationModal  = false;
  diAValider: any      = null;
  affectationChoisie: string | null = null;

  // ── Rejet ──
  showRejetModal = false;
  diAReject: any = null;
  causeRejet     = '';

  rolesTechnicien = [
    { value: 'GRA',     label: 'Graisseur'         },
    { value: 'MEC',     label: 'Mécanicien'        },
    { value: 'ELEC',    label: 'Électricien'       },
    { value: 'HYDR',    label: 'Hydraulicien'      },
    { value: 'SOUD',    label: 'Soudeur'           },
    { value: 'ELECMEC', label: 'Électromécanicien' },
    { value: 'AUTO',    label: 'Automaticien'      },
    { value: 'INSPE',   label: 'Inspecteur'        },
    { value: 'INSMEC',  label: 'Inspecteur mécanique' },
    { value: 'EXEC',    label: 'Exécutant'         },
    { value: 'CHAUD',   label: 'Chaudronnier'      },
    { value: 'INSTR',   label: 'Instrumentiste'    },
    { value: 'TUY',     label: 'Tuyautier'         },
    { value: 'PROD',    label: 'Production'        },
    { value: 'INSHYD',  label: 'Inspecteur hydraulique' }
    
  ];

  constructor(
    private diService: DiService,
    private http: HttpClient,
    private router: Router,
    public roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
  this.loading = true;
  this.diService.getAll().subscribe({
    next: (data) => {
      // TRICHE / ORDONNANCEMENT : Tri du plus récent au plus ancien
      this.demandes = data.sort((a, b) => {
        return new Date(b.dateDemande).getTime() - new Date(a.dateDemande).getTime();
      });

      this.applyFilters();
      this.loading = false;
    },
    error: () => this.loading = false
  });
}

  applyFilters(): void {
    this.filtered = this.demandes.filter(di => {
      const q = this.searchQuery.toLowerCase();

      const matchSearch = !q ||
        di.codeDI?.toLowerCase().includes(q) ||
        di.description?.toLowerCase().includes(q) ||
        di.equipement?.codeEquipement?.toLowerCase().includes(q) ||
        di.equipement?.libelle?.toLowerCase().includes(q);

      const fe = this.filters.equipement.toLowerCase();
      const matchEquip = !fe ||
        di.equipement?.codeEquipement?.toLowerCase().includes(fe) ||
        di.equipement?.libelle?.toLowerCase().includes(fe);

      const matchAnomalie    = this.filters.anomalie    === 'all' || di.natureAnomalie === this.filters.anomalie;
      const matchAffectation = this.filters.affectation === 'all' || di.affectationTechnicien === this.filters.affectation;
      const matchPriorite    = this.filters.priorite    === 'all' || di.priorite       === this.filters.priorite;
      const matchStatut      = this.filters.statut      === 'all' || di.statut         === this.filters.statut;
      const matchDate        = !this.filters.date                 || di.dateDemande?.startsWith(this.filters.date);

      return matchSearch && matchEquip && matchAnomalie && matchAffectation
          && matchPriorite && matchStatut && matchDate;
    });
  }

  countByStatut(statut: string): number {
    return this.demandes.filter(d => d.statut === statut).length;
  }

  openCreateModal(): void { this.router.navigate(['/di/new']); }
  goToDetail(di: any): void { this.router.navigate(['/di/details', di.id]); }
  goToEdit(di: any): void   { this.router.navigate(['/di', di.id, 'edit']); }
  
  supprimerDI(di: any): void {
  if (!confirm(`Supprimer définitivement la DI ${di.codeDI} ?`)) return;
  this.diService.delete(di.id).subscribe({
    next: () => this.loadDemandes(),
    error: (err) => alert('Erreur : ' + (err?.error?.message || err.message))
  });
}

  getPrioriteClass(p: string): string {
    return ({ Urgente: 'badge-red', Haute: 'badge-orange', Normale: 'badge-blue', Basse: 'badge-grey' } as any)[p] ?? 'badge-grey';
  }

  formatStatut(s: string): string {
  return ({
    Cree:    'Créée',
    Validee: 'Validée',
    Rejetee: 'Rejetée'
  } as any)[s] ?? s;
}
  getStatutClass(s: string): string {
    return ({ Cree: 'badge-grey', Validee: 'badge-green', Rejetee: 'badge-red' } as any)[s] ?? 'badge-grey';
  }

  // ── Validation ──
 validationError = '';
rejetError = '';

ouvrirModalValidation(di: any): void {
  this.diAValider = di;
  this.affectationChoisie = null;
  this.titreOT = '';
  this.validationError = '';
  this.showValidationModal = true;
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
  this.diService.valider(this.diAValider.id, this.affectationChoisie, this.titreOT).subscribe({
    next: () => { this.fermerModalValidation(); this.loadDemandes(); },
    error: (err) => this.validationError = err?.error?.message || 'Erreur lors de la validation.'
  });
}

ouvrirModalRejet(di: any): void {
  this.diAReject = di;
  this.causeRejet = '';
  this.rejetError = '';
  this.showRejetModal = true;
}

confirmerRejet(): void {
  if (!this.causeRejet?.trim()) {
    this.rejetError = 'Le motif du rejet est obligatoire.';
    return;
  }
  this.rejetError = '';
  this.diService.rejeter(this.diAReject.id, this.causeRejet).subscribe({
    next: () => { this.fermerModalRejet(); this.loadDemandes(); },
    error: (err) => this.rejetError = err?.error?.message || 'Erreur lors du rejet.'
  });
}
  fermerModalValidation(): void {
    this.showValidationModal = false;
    this.diAValider = null;
    this.affectationChoisie = null;
    this.titreOT = '';
  }


  fermerModalRejet(): void {
    this.showRejetModal = false;
    this.diAReject = null;
    this.causeRejet = '';
  }
}