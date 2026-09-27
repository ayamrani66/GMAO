import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OtService } from '../../services/ot.service';
import * as XLSX from 'xlsx-js-style';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-ot-preventif-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ot-preventif-list.component.html',
  styleUrls: ['./ot-preventif-list.component.css']
})
export class OtPreventifListComponent implements OnInit {

  ordres: any[] = [];
  filtered: any[] = [];
  loading = false;

  filters = {
    equipement:  '',
    priorite:    'all',
    affectation: 'all',
    nature:      'all',
    statut:      'all',
    creePar:     '',      
  creeLe:      '', 
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
  INSMEC:  'Inspecteur Mécanique',
  INSHYD:  'Inspecteur Hydraulique',
  PROD:    'Production',
  EXEC:    'Execution',
  CHAUD:   'Chaudronnier',
  INSTR:   'Instrumentiste',
  TUY:     'Tuyautier'
  
};

  toutesLesPriorites    = ['Urgente', 'Haute', 'Normale', 'Basse'];
  toutesLesAffectations = ['GRA', 'MEC', 'ELEC', 'HYDR', 'SOUD', 'ELECMEC', 'AUTO', 'INSPE', 'INSMEC', 'INSHYD', 'PROD','EXEC', 'CHAUD', 'INSTR', 'TUY'];
  toutesLesAnomalies    = ['Mecanique', 'Hydraulique', 'Electrique', 'Thermique', 'Chaudronnerie', 'Pnematique', 'Inspection','Lubrification', 'Graissage', 'Instrumentation', 'Automatisme', 'Autre'];
  tousLesStatuts = ['Cree', 'En_cours_planification', 'Planifie', 'En_cours_preparation', 'Prepare', 'Termine', 'Cloture'];

  constructor(private otService: OtService, private router: Router, public roleService: RoleService) {}

  ngOnInit(): void {
    this.loadOrdres();
  }

  loadOrdres(): void {
    this.loading = true;
    this.otService.getAllPreventifs().subscribe({
      next: (data) => {
        this.ordres = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

// Ajouter cette propriété
activeTab: 'pmp' | 'planifie' = 'pmp';

// Modifier applyFilters() pour séparer selon gamme
applyFilters(): void {
  const terme = this.filters.equipement.toLowerCase().trim();

  // Séparer d'abord PMP vs Planifié
  const source = this.activeTab === 'pmp'
    ? this.ordres.filter(ot => ot.gamme != null)
    : this.ordres.filter(ot => ot.gamme == null);

  this.filtered = source
    .map(ot => {
      const ops = ot.gamme?.operations ?? [];
      const operationsFiltrees = terme
        ? ops.filter((op: any) =>
            op.equipement?.toLowerCase().includes(terme) ||
            op.sousEquipement?.toLowerCase().includes(terme) ||
            op.action?.toLowerCase().includes(terme)
          )
        : [];
      return { ...ot, operationsFiltrees };
    })
    .filter(ot => {
      if (terme && this.activeTab === 'pmp' && ot.operationsFiltrees.length === 0) return false;
      if (terme && this.activeTab === 'planifie') {
        const matchEquip =
          ot.zone?.libelle?.toLowerCase().includes(terme) ||
          ot.zone?.codeEquipement?.toLowerCase().includes(terme) ||
          ot.titre?.toLowerCase().includes(terme);
        if (!matchEquip) return false;
      }
       if (this.activeTab === 'planifie') {
    if (this.filters.creePar) {
      const nomComplet = (ot.superviseur?.nomComplet || '').toLowerCase();
      if (!nomComplet.includes(this.filters.creePar.toLowerCase())) return false;
    }
    if (this.filters.creeLe) {
      const dateOT = ot.dateCreation ? new Date(ot.dateCreation).toISOString().split('T')[0] : '';
      if (dateOT !== this.filters.creeLe) return false;
    }
  }
      const matchPriorite    = this.filters.priorite    === 'all' || ot.priorite === this.filters.priorite;
      const matchAffectation = this.filters.affectation === 'all' || ot.affectationTechnicien === this.filters.affectation;
      const matchNature      = this.filters.nature      === 'all' || ot.natureAnomalie === this.filters.nature;
      const matchStatut      = this.filters.statut      === 'all' || ot.statut === this.filters.statut;
      return matchPriorite && matchAffectation && matchNature && matchStatut;
    });
}

// Setter d'onglet
setTab(tab: 'pmp' | 'planifie'): void {
  this.activeTab = tab;
  this.filters.equipement  = '';
  this.filters.affectation = 'all';
  this.filters.nature      = 'all';
  this.filters.statut      = 'all';
  this.filters.priorite    = 'all';
  this.filters.creePar     = '';   
  this.filters.creeLe      = '';   
  this.applyFilters();
}

// Compteurs pour les badges
get countPMP(): number     { return this.ordres.filter(o => o.gamme != null).length; }
get countPlanifie(): number { return this.ordres.filter(o => o.gamme == null).length; }
      getTotalOperations(): number {
    return this.filtered.reduce((sum, ot) => sum + (ot.operationsFiltrees?.length ?? 0), 0);
  }

  formatStatut(s: string): string {
  return ({
    Cree:                   'Créé',
    En_cours_planification: 'En cours de planification',
    Planifie:               'Planifié',
    En_cours_preparation:   'En cours de préparation',
    Prepare:                'Préparé',
    Termine:                'Terminé',
    Cloture:                'Clôturé'
  } as any)[s] ?? s;
}
formatPriorite(p: string): string {
  return ({
    Urgente: 'Urgente',
    Haute:   'Haute',
    Normale: 'Normale',
    Basse:   'Basse'
  } as any)[p] ?? p;
}

  getPrioriteClass(p: string): string {
    return ({ Urgente: 'badge-red', Haute: 'badge-orange', Normale: 'badge-blue', Basse: 'badge-green' } as any)[p] ?? 'badge-grey';
  }

  getStatutClass(s: string): string {
  const statusMap: Record<string, string> = {
    'Cree':                   'badge-grey',
    'En_cours_planification': 'badge-blue',   // Existe dans votre CSS
    'Planifie':               'badge-cyan',   // Existe dans votre CSS (mieux que vert pour différencier)
    'En_cours_preparation':   'badge-amber',  // On utilise amber à la place de yellow
    'Prepare':                'badge-indigo', // On utilise indigo à la place de purple
    'Termine':                'badge-green',  // Existe dans votre CSS
    'Cloture':                'badge-dark'    // On utilise dark ou grey
  };

  return statusMap[s] || 'badge-grey';
}

  openCreateModal(): void { this.router.navigate(['/ot-preventif/new']); }
  goToDetail(ot: any): void { 
      this.router.navigate(['/ot-preventif/details', ot.id], { 
    queryParams: { filter: this.filters.equipement } 
  });
  }
  goToEdit(ot: any): void   { this.router.navigate(['/ot-preventif', ot.id, 'edit']); }

  exportPMP(): void {
  const timestamp = this.getTimestamp();
  this.otService.getAllPreventifs().subscribe({
    next: (preventifs) => {
      const pmp = preventifs.filter((ot: any) => ot.gamme != null);

      const dataResume = pmp.map((ot: any) => ({
        'Code OT':           ot.codeOT || ot.id,
        'Description Gamme': ot.gamme?.descriptionGamme || '',
        'Gamme':             ot.gamme?.codeGamme || '',
        'Frequence':         ot.gamme?.frequence || '',
        'Code Equipement':   ot.zone?.codeEquipement || '',
        'Zone':              ot.zone?.libelle || '',
        'Priorite':          ot.priorite || '',
        'Technicien':        this.affectationLabels[ot.affectationTechnicien] || ot.affectationTechnicien || '',
        'Statut':            this.formatStatut(ot.statut),
        'Date Creation':     ot.dateCreation ? new Date(ot.dateCreation).toLocaleDateString('fr-FR') : '',
        'Debut Intervention':ot.dateDebutIntervention ? new Date(ot.dateDebutIntervention).toLocaleString('fr-FR') : '',
        'Fin Intervention':  ot.dateFinIntervention ? new Date(ot.dateFinIntervention).toLocaleString('fr-FR') : '',
        'Duree (min)':       ot.dureeIntervention ?? '',
        'Cout (MAD)':        ot.coutIntervention ?? '',
        'Nb Actions Total':  ot.gamme?.operations?.length ?? 0,
        'Nb Actions Faites': ot.checklist?.filter((c: any) => c.estFaite)?.length ?? 0,
        'Derniere Execution':ot.derniereExecution ? new Date(ot.derniereExecution).toLocaleDateString('fr-FR') : '',
        'Date Cloture':      ot.dateCloture ? new Date(ot.dateCloture).toLocaleDateString('fr-FR') : '',
      }));

      const dataActions: any[] = [];
      pmp.forEach((ot: any) => {
        if (!ot.gamme?.operations?.length) return;

        const checklistMap = new Map<number, boolean>();
        ot.checklist?.forEach((c: any) => {
          checklistMap.set(c.operation?.id, c.estFaite ?? false);
        });

        ot.gamme.operations.forEach((op: any) => {
          const realise = checklistMap.size > 0
            ? (checklistMap.has(op.id) ? (checklistMap.get(op.id) ? 'Oui' : 'Non') : 'N/A')
            : 'N/A';
          dataActions.push({
            'Code OT':           ot.codeOT || ot.id,
            'Description Gamme': ot.gamme?.descriptionGamme || '',
            'Zone':              ot.zone?.libelle || '',
            'Equipement':        op.equipement || '',
            'Sous-equipement':   op.sousEquipement || '',
            'Action':            op.action || '',
            'Moyen Controle':    op.moyenControle || '',
            'M/A':               op.modeMa || '',
            'Frequence':         ot.gamme?.frequence || '',
            'Technicien':        this.affectationLabels[op.posteTravailOperation] || op.posteTravailOperation || '',
            'Realisee':          realise,
          });
        });
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, this.buildWorksheet(dataResume,  'FFA770'), 'PMP Resume');
      XLSX.utils.book_append_sheet(wb, this.buildWorksheet(dataActions, '4A7C59'), 'PMP Detail Actions');
      XLSX.writeFile(wb, `GMAO_Export_PMP_${timestamp}.xlsx`);
    },
    error: (err) => console.error('Erreur export PMP :', err)
  });
}

exportPlanifie(): void {
  const timestamp = this.getTimestamp();
  this.otService.getAllPreventifs().subscribe({
    next: (preventifs) => {
      const planifies = preventifs.filter((ot: any) => ot.gamme == null);

      const dataResume = planifies.map((ot: any) => ({
        'Code OT':           ot.codeOT || ot.id,
        'Titre':             ot.titre || '',
        'Code Equipement':   ot.zone?.codeEquipement || '',
        'Zone':              ot.zone?.libelle || '',
        'Priorite':          ot.priorite || '',
        'Technicien':        this.affectationLabels[ot.affectationTechnicien] || ot.affectationTechnicien || '',
        'Nature Anomalie':   ot.natureAnomalie || '',
        'Cree Par':          ot.superviseur?.nomComplet || '',
        'Statut':            this.formatStatut(ot.statut),
        'Date Creation':     ot.dateCreation ? new Date(ot.dateCreation).toLocaleDateString('fr-FR') : '',
        'Debut Intervention':ot.dateDebutIntervention ? new Date(ot.dateDebutIntervention).toLocaleString('fr-FR') : '',
        'Fin Intervention':  ot.dateFinIntervention ? new Date(ot.dateFinIntervention).toLocaleString('fr-FR') : '',
        'Duree (min)':       ot.dureeIntervention ?? '',
        'Cout (MAD)':        ot.coutIntervention ?? '',
        'Pieces Consommees': ot.piecesConsommees?.map((p: any) =>
                               `${p.pieceRechange?.designation} x${p.quantiteConsommee}`).join(' | ') || '',
        'Nb Actions Total':  ot.actionsStructurees?.length ?? 0,
        'Nb Actions Faites': ot.actionsStructurees?.filter((a: any) => a.estFaite).length ?? 0,
        'Date Cloture':      ot.dateCloture ? new Date(ot.dateCloture).toLocaleDateString('fr-FR') : '',
      }));

      // ── Détail actions structurées (saisies dans le formulaire) ──
      const dataActions: any[] = [];
      planifies.forEach((ot: any) => {
        if (!ot.actionsStructurees?.length) return;
        ot.actionsStructurees.forEach((a: any) => {
          dataActions.push({
            'Code OT':         ot.codeOT || ot.id,
            'Titre OT':        ot.titre || '',
            'Zone':            ot.zone?.libelle || '',
            'Equipement':      a.equipement || '',
            'Sous-equipement': a.sousEquipement || '',
            'Action':          a.action || '',
            'Mode':            a.mode || '',
            'Moyen Controle':  a.moyenControle || '',
            'Technicien':      this.affectationLabels[a.affectationTechnicien] || a.affectationTechnicien || '',
            'Nature Anomalie': a.natureAnomalie || '',
            'Realisee':        a.estFaite ? 'Oui' : 'Non',
          });
        });
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, this.buildWorksheet(dataResume,  '6C8EBF'), 'OT Planifies');
      XLSX.utils.book_append_sheet(wb, this.buildWorksheet(dataActions, '7B68EE'), 'Detail Actions');
      XLSX.writeFile(wb, `GMAO_Export_Planifie_${timestamp}.xlsx`);
    },
    error: (err) => console.error('Erreur export Planifié :', err)
  });
}

// Utilitaire timestamp
private getTimestamp(): string {
  const now = new Date();
  return now.toLocaleDateString('fr-FR').replace(/\//g, '-') + '_' +
         now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
}

private buildWorksheet(data: any[], headerColor: string): XLSX.WorkSheet {
  const worksheet: XLSX.WorkSheet = data.length > 0
    ? XLSX.utils.json_to_sheet(data)
    : XLSX.utils.json_to_sheet([{ 'Aucune donnee': '' }]);

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  // En-têtes
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddr]) continue;
    worksheet[cellAddr].s = {
      font:      { bold: true, color: { rgb: 'FFFFFF' }, name: 'Arial', sz: 11 },
      fill:      { patternType: 'solid', fgColor: { rgb: headerColor } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        bottom: { style: 'thin', color: { rgb: '888888' } },
        right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
      }
    };
  }

  // Lignes alternées
  for (let row = 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddr]) continue;
      worksheet[cellAddr].s = {
        fill:      { patternType: 'solid', fgColor: { rgb: row % 2 === 0 ? 'F2F7FF' : 'FFFFFF' } },
        font:      { name: 'Arial', sz: 10 },
        alignment: { vertical: 'center' },
        border:    { right: { style: 'hair', color: { rgb: 'DDDDDD' } } }
      };
    }
  }

  // Largeur colonnes
  if (data.length > 0) {
    worksheet['!cols'] = Object.keys(data[0]).map(key => ({
      wch: Math.min(50, Math.max(
        key.length + 2,
        ...data.map(row => String(row[key] ?? '').length)
      ))
    }));
  }

  worksheet['!rows'] = [{ hpt: 30 }];
  return worksheet;
}
}