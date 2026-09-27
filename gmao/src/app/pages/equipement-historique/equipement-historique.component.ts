import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipementService } from '../../services/equipement.service';
import { DiService } from '../../services/di.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-equipement-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipement-historique.component.html',
  styleUrls: ['./equipement-historique.component.css']
})
export class EquipementHistoriqueComponent implements OnInit {

  equipementId!: number;
  equipement: any = null;
  coutTotal: number = 0;

  // ===== OT =====
  ordres: any[] = [];
  ordresFiltres: any[] = [];
  loadingOt = false;

  // ===== DI =====
  demandes: any[] = [];
  demandesFiltrees: any[] = [];
  loadingDi = false;

  // ===== PDR =====
  pdrConsommees: any[] = [];
  pdrFiltrees: any[] = [];

  // ===== ONGLET ACTIF =====
  activeSection: 'ot' | 'di' | 'pdr' = 'ot';

      affectationLabels: Record<string, string> = {
  GRA:     'Graisseur',
  MEC:     'Mécanicien',
  ELEC:    'Électricien',
  HYDR:    'Hydraulicien',
  SOUD:    'Soudeur',
  ELECMEC: 'Électromécanicien',
  AUTO:    'Automaticien',
  INSPE:   'Inspecteur',
};

  // ===== OPTIONS LISTES DÉROULANTES =====
  readonly typeOTOptions    = ['Correctif', 'Preventif'];
  readonly prioriteOptions  = ['Urgente', 'Haute', 'Normale', 'Basse'];
  readonly statutOTOptions  = ['Cree', 'En_cours_planification','Planifie','Prepare','En_cours_preparation', 'Termine', 'Cloture'];
  readonly techOptions      = ['GRA', 'MEC', 'ELEC', 'HYDR', 'SOUD', 'ELECMEC', 'AUTO', 'INSPE']; 
  readonly natureOptions    = ['Mecanique','Hydraulique','Electrique','Thermique','Chaudronnerie','Pnematique','Inspection','Lubrification'];
  readonly statutDIOptions  = ['Cree', 'Validee', 'Rejetee'];
  readonly sourceOptions    = ['Maintenance', 'Inspection', 'Production'];

  // ===== FILTRES OT =====
  filtreOt: Record<string, string> = {
    typeOT: '', priorite: '', statut: '',
    affectationTechnicien: '', natureAnomalie: '', titre: ''
  };
  sortOtDate: '' | 'asc' | 'desc' = '';
  sortOtCout: '' | 'asc' | 'desc' = '';

  // ===== FILTRES DI =====
  filtreDi: Record<string, string> = {
    description: '', source: '', priorite: '', statut: ''
  };
  sortDiDate: '' | 'asc' | 'desc' = '';

  // ===== FILTRES PDR =====
  filtrePdr: Record<string, string> = { article: '', unite: '' };
  sortPdrPrix: '' | 'asc' | 'desc' = '';
  sortPdrQte:  '' | 'asc' | 'desc' = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private equipementService: EquipementService,
    private diService: DiService,
    public roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.equipementId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.loadingOt = true;
    this.loadingDi = true;

    this.http.get<any>(`${environment.apiUrl}/equipements/${this.equipementId}`)
      .subscribe({ next: (data) => this.equipement = data });

    this.equipementService.getHistorique(this.equipementId).subscribe({
      next: (data) => {
        this.ordres = data.ots;
        this.ordresFiltres = [...this.ordres];
        this.coutTotal = data.coutTotal ?? 0;

        this.pdrConsommees = this.ordres.flatMap(ot =>
          (ot.piecesConsommees ?? []).map((pc: any) => ({
            codeOT:            ot.codeOT || ('#' + ot.id),
            article:           (pc.pieceRechange?.code ?? '') + ' — ' + (pc.pieceRechange?.nom ?? ''),
            quantiteConsommee: pc.quantiteConsommee,
            unite:             pc.pieceRechange?.unite ?? '',
            prixUnitaire:      pc.pieceRechange?.prixUnitaire ?? null,
          }))
        );
        this.pdrFiltrees = [...this.pdrConsommees];
        this.loadingOt = false;
      },
      error: () => this.loadingOt = false
    });

    this.http.get<any[]>(`${environment.apiUrl}/di/by-equipement/${this.equipementId}`)
      .subscribe({
        next: (data) => { this.demandes = data; this.demandesFiltrees = [...this.demandes]; this.loadingDi = false; },
        error: () => this.loadingDi = false
      });
  }

  // ===== FILTRAGE + TRI OT =====
  appliquerFiltresOt(): void {
    let result = this.ordres.filter(ot => {
      const f = this.filtreOt;
      return (
        (!f['typeOT']                || ot.typeOT === f['typeOT']) &&
        (!f['priorite']              || ot.priorite === f['priorite']) &&
        (!f['statut']                || ot.statut === f['statut']) &&
        (!f['affectationTechnicien'] || ot.affectationTechnicien === f['affectationTechnicien']) &&
        (!f['natureAnomalie']        || ot.natureAnomalie === f['natureAnomalie']) &&
        (!f['titre']                 || (ot.titre ?? '').toLowerCase().includes(f['titre'].toLowerCase()))
      );
    });

    if (this.sortOtDate === 'asc')
      result = result.sort((a, b) => new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime());
    else if (this.sortOtDate === 'desc')
      result = result.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());

    if (this.sortOtCout === 'asc')
      result = result.sort((a, b) => (a.coutIntervention ?? 0) - (b.coutIntervention ?? 0));
    else if (this.sortOtCout === 'desc')
      result = result.sort((a, b) => (b.coutIntervention ?? 0) - (a.coutIntervention ?? 0));

    this.ordresFiltres = result;
  }

  cycleSort(current: '' | 'asc' | 'desc'): '' | 'asc' | 'desc' {
    if (current === '')     return 'asc';
    if (current === 'asc')  return 'desc';
    return '';
  }

  toggleSortOtDate(): void  { this.sortOtDate = this.cycleSort(this.sortOtDate); this.appliquerFiltresOt(); }
  toggleSortOtCout(): void  { this.sortOtCout = this.cycleSort(this.sortOtCout); this.appliquerFiltresOt(); }
  toggleSortDiDate(): void  { this.sortDiDate = this.cycleSort(this.sortDiDate); this.appliquerFiltresDi(); }
  toggleSortPdrPrix(): void { this.sortPdrPrix = this.cycleSort(this.sortPdrPrix); this.appliquerFiltresPdr(); }
  toggleSortPdrQte(): void  { this.sortPdrQte  = this.cycleSort(this.sortPdrQte);  this.appliquerFiltresPdr(); }

  sortIcon(val: '' | 'asc' | 'desc'): string {
    if (val === 'asc')  return 'ti-sort-ascending';
    if (val === 'desc') return 'ti-sort-descending';
    return 'ti-arrows-sort';
  }

  // ===== FILTRAGE + TRI DI =====
  appliquerFiltresDi(): void {
    let result = this.demandes.filter(di => {
      const f = this.filtreDi;
      return (
        (!f['description'] || (di.description ?? '').toLowerCase().includes(f['description'].toLowerCase())) &&
        (!f['source']      || di.source === f['source']) &&
        (!f['priorite']    || di.priorite === f['priorite']) &&
        (!f['statut']      || di.statut === f['statut'])
      );
    });

    if (this.sortDiDate === 'asc')
      result = result.sort((a, b) => new Date(a.dateDemande).getTime() - new Date(b.dateDemande).getTime());
    else if (this.sortDiDate === 'desc')
      result = result.sort((a, b) => new Date(b.dateDemande).getTime() - new Date(a.dateDemande).getTime());

    this.demandesFiltrees = result;
  }

  // ===== FILTRAGE + TRI PDR =====
  appliquerFiltresPdr(): void {
    let result = this.pdrConsommees.filter(pdr => {
      const f = this.filtrePdr;
      return (
        (!f['article'] || (pdr.article ?? '').toLowerCase().includes(f['article'].toLowerCase())) &&
        (!f['unite']   || (pdr.unite ?? '').toLowerCase().includes(f['unite'].toLowerCase()))
      );
    });

    if (this.sortPdrQte === 'asc')
      result = result.sort((a, b) => (a.quantiteConsommee ?? 0) - (b.quantiteConsommee ?? 0));
    else if (this.sortPdrQte === 'desc')
      result = result.sort((a, b) => (b.quantiteConsommee ?? 0) - (a.quantiteConsommee ?? 0));

    if (this.sortPdrPrix === 'asc')
      result = result.sort((a, b) => (a.prixUnitaire ?? 0) - (b.prixUnitaire ?? 0));
    else if (this.sortPdrPrix === 'desc')
      result = result.sort((a, b) => (b.prixUnitaire ?? 0) - (a.prixUnitaire ?? 0));

    this.pdrFiltrees = result;
  }

  // ===== UTILS =====
  formatStatut(statut: string): string {
    const map: Record<string, string> = {
      'Cree': 'Créé', 'En_cours_planification': 'En cour de Planification','Planifie': 'Planifié','Prepare': 'Préparé',
      'En_cours_preparation': 'En cour de Préparation', 'Termine': 'Terminé', 'Cloture': 'Clôturé'
    };
    return map[statut] ?? statut;
  }

  formatStatutDi(statut: string): string {
    const map: Record<string, string> = {
      'Cree': 'Créée', 'Validee': 'Validée', 'Rejetee': 'Rejetée'
    };
    return map[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      Cree:                   'badge-grey',
    En_cours_planification: 'badge-blue',
    Planifie:               'badge-orange',
    En_cours_preparation:   'badge-blue',
    Prepare:                'badge-orange',
    Termine:                'badge-green',
    Cloture:                'badge-grey'
    };
    return map[statut] ?? 'badge-grey';
  }

  getStatutDiClass(statut: string): string {
    const map: Record<string, string> = {
      'Cree': 'badge-grey', 'Validee': 'badge-green', 'Rejetee': 'badge-red'
    };
    return map[statut] ?? 'badge-grey';
  }

  getPrioriteClass(priorite: string): string {
    const map: Record<string, string> = {
      'Urgente': 'badge-red', 'Haute': 'badge-orange',
      'Normale': 'badge-blue', 'Basse': 'badge-grey'
    };
    return map[priorite] ?? 'badge-grey';
  }

  goBack(): void {
    this.router.navigate(['/equipements']);
  }

  goToDetailOt(ot: any): void {
    const id = ot.id || ot.codeOT;
    
    const type = ot.typeOT?.toLowerCase();

    if (type?.includes('correctif')) {
      this.router.navigate(['/ot-correctif/details', id]);
    } else if (type?.includes('preventif') || type?.includes('préventif')) {
      this.router.navigate(['/ot-preventif/details', id]);
    } else {
      console.warn("Type d'OT non reconnu :", ot.typeOT);
    }
  }
  goToDetailDi(di: any): void {
    const id = di.id || di.codeDI;
    this.router.navigate(['/di/details', id]);
  }
}