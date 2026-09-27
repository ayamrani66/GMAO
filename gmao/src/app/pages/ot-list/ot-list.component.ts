import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OtService } from '../../services/ot.service';
import * as XLSX from 'xlsx-js-style';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-ot-correctif-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ot-list.component.html',
  styleUrls: ['./ot-list.component.css']
})
export class OtListComponent implements OnInit {

  ordres: any[] = [];
  filtered: any[] = [];
  loading = false;

  filters = {
    di:          '',       // ← filtre sur codeDI de la DI liée
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
  INSMEC:  'Inspecteur mécanique',
  EXEC:    'Exécutant',
  CHAUD:   'Chaudronnier',
  INSTR:   'Instrumentiste',
  TUY:     'Tuyautier',
  PROD:    'Production',
  INSHYD: 'Inspecteur hydraulique'
};

  toutesLesPriorites    = ['Urgente', 'Haute', 'Normale', 'Basse'];
  toutesLesAffectations = ['GRA', 'MEC', 'ELEC', 'HYDR', 'SOUD', 'ELECMEC', 'AUTO', 'INSPE', 'INSMEC', 'EXEC', 'CHAUD', 'INSTR', 'TUY', 'PROD', 'INSHYD'];
  toutesLesAnomalies    = ['Mecanique', 'Hydraulique', 'Electrique', 'Thermique', 'Chaudronnerie', 'Pnematique', 'Inspection', 'Graissage', 'Instrumentation'];
  tousLesStatuts = ['Cree', 'En_cours_planification', 'Planifie', 'En_cours_preparation', 'Prepare', 'Termine', 'Cloture'];

  constructor(private otService: OtService, private router: Router,public roleService: RoleService) {}

  ngOnInit(): void {
    this.loadOrdres();
  }

  loadOrdres(): void {
    this.loading = true;
    this.otService.getAllCorrectifs().subscribe({
      next: (data) => {
        console.log('OT correctif exemple:', JSON.stringify(data[0]));
        this.ordres = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }


  applyFilters(): void {
    this.filtered = this.ordres.filter(ot => {
      const fdi = this.filters.di.toLowerCase();
      const matchDI = !fdi ||
  ot.di?.codeDI?.toLowerCase().includes(fdi) ||
  String(ot.di?.id ?? '').includes(fdi);

      const fe = this.filters.equipement.toLowerCase();
      const matchEquip = !fe ||
        ot.zone?.codeEquipement?.toLowerCase().includes(fe) ||
        ot.zone?.libelle?.toLowerCase().includes(fe);
      if (this.filters.creePar) {
      const nomComplet = (ot.superviseur?.nomComplet || '').toLowerCase();
      if (!nomComplet.includes(this.filters.creePar.toLowerCase())) return false;
    }
    if (this.filters.creeLe) {
      const dateOT = ot.dateCreation ? new Date(ot.dateCreation).toISOString().split('T')[0] : '';
      if (dateOT !== this.filters.creeLe) return false;
    }
      const matchPriorite    = this.filters.priorite    === 'all' || ot.priorite              === this.filters.priorite;
      const matchAffectation = this.filters.affectation === 'all' || ot.affectationTechnicien === this.filters.affectation;
      const matchNature      = this.filters.nature      === 'all' || ot.natureAnomalie        === this.filters.nature;
      const matchStatut      = this.filters.statut      === 'all' || ot.statut                === this.filters.statut;

      return matchDI && matchEquip && matchPriorite && matchAffectation && matchNature && matchStatut;
    });
  }
  getPrioriteClass(p: string): string {
    return ({ Urgente: 'badge-red', Haute: 'badge-orange', Normale: 'badge-blue', Basse: 'badge-grey' } as any)[p] ?? 'badge-grey';
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

getStatutClass(s: string): string {
  return ({
    Cree:                   'badge-grey',
    En_cours_planification: 'badge-blue',
    Planifie:               'badge-orange',
    En_cours_preparation:   'badge-blue',
    Prepare:                'badge-orange',
    Termine:                'badge-green',
    Cloture:                'badge-grey'
  } as any)[s] ?? 'badge-grey';
}

exportToExcel(): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR').replace(/\//g, '-');
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  const timestamp = `${dateStr}_${timeStr}`;

  // ── Correctifs : données déjà chargées dans this.ordres ──
  const dataCorrectifs = this.ordres.map(ot => ({
    'Code OT':               ot.codeOT || ot.id,
    'Titre':                 ot.titre || '',
    'DI Liée':               ot.di?.codeDI || '',
    'Code Équipement':       ot.zone?.codeEquipement || '',
    'Libellé Équipement':    ot.zone?.libelle || '',
    'Priorité':              ot.priorite || '',
    'Technicien Affecté':    this.affectationLabels[ot.affectationTechnicien] || ot.affectationTechnicien || '',
    'Nature Anomalie':       ot.natureAnomalie || '',
    'Statut':                this.formatStatut(ot.statut),
    'Date Création':         ot.dateCreation ? new Date(ot.dateCreation).toLocaleDateString('fr-FR') : '',
    'Début Intervention':    ot.dateDebutIntervention ? new Date(ot.dateDebutIntervention).toLocaleString('fr-FR') : '',
    'Fin Intervention':      ot.dateFinIntervention ? new Date(ot.dateFinIntervention).toLocaleString('fr-FR') : '',
    'Durée (min)':           ot.dureeIntervention ?? '',
    'Coût Intervention (MAD)': ot.coutIntervention ?? '',
    'Pièces Consommées':     ot.piecesConsommees?.map((p: any) => `${p.pieceRechange?.designation} x${p.quantiteConsommee}`).join(' | ') || '',
    'Date Clôture':          ot.dateCloture ? new Date(ot.dateCloture).toLocaleDateString('fr-FR') : '',
  }));

  // ── Préventifs : appel API séparé ──
  this.otService.getAllPreventifs().subscribe({
    next: (preventifs) => {
      const dataPreventifs = preventifs.map((ot: any) => ({
        'Code OT':               ot.codeOT || ot.id,
        'Titre':                 ot.titre || '',
        'Gamme':                 ot.gamme?.codeGamme || '',
        'Description Gamme':     ot.gamme?.descriptionGamme || '',
        'Code Équipement':       ot.zone?.codeEquipement || '',
        'Libellé Équipement':    ot.zone?.libelle || '',
        'Fréquence':             ot.gamme?.frequence || '',
        'Priorité':              ot.priorite || '',
        'Technicien Affecté':    this.affectationLabels[ot.affectationTechnicien] || ot.affectationTechnicien || '',
        'Statut':                this.formatStatut(ot.statut),
        'Date Création':         ot.dateCreation ? new Date(ot.dateCreation).toLocaleDateString('fr-FR') : '',
        'Début Intervention':    ot.dateDebutIntervention ? new Date(ot.dateDebutIntervention).toLocaleString('fr-FR') : '',
        'Fin Intervention':      ot.dateFinIntervention ? new Date(ot.dateFinIntervention).toLocaleString('fr-FR') : '',
        'Durée (min)':           ot.dureeIntervention ?? '',
        'Coût Intervention (MAD)': ot.coutIntervention ?? '',
        'Pièces Consommées':     ot.piecesConsommees?.map((p: any) => `${p.pieceRechange?.designation} x${p.quantiteConsommee}`).join(' | ') || '',
        'Dernière Exécution':    ot.derniereExecution ? new Date(ot.derniereExecution).toLocaleDateString('fr-FR') : '',
        'Date Clôture':          ot.dateCloture ? new Date(ot.dateCloture).toLocaleDateString('fr-FR') : '',
      }));

      const workbook: XLSX.WorkBook = XLSX.utils.book_new();

      [
        { data: dataCorrectifs, sheetName: 'OT Correctifs' },
        { data: dataPreventifs, sheetName: 'OT Préventifs' },
      ].forEach(({ data, sheetName }) => {

        // Feuille vide si aucune donnée
        const worksheet: XLSX.WorkSheet = data.length > 0
          ? XLSX.utils.json_to_sheet(data)
          : XLSX.utils.json_to_sheet([{}]);

        // ── Style en-têtes ──
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!worksheet[cellAddr]) continue;
          worksheet[cellAddr].s = {
            font:      { bold: true, color: { rgb: 'FFFFFF' }, name: 'Arial', sz: 11 },
            fill:      { patternType: 'solid', fgColor: { rgb: 'FFA770' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
              bottom: { style: 'thin', color: { rgb: '888888' } },
              right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
            }
          };
        }

        // ── Largeur automatique ──
        if (data.length > 0) {
          worksheet['!cols'] = Object.keys(data[0]).map(key => ({
            wch: Math.max(
              key.length + 2,
              ...data.map(row => String((row as any)[key] ?? '').length)
            )
          }));
        }

        worksheet['!rows'] = [{ hpt: 30 }];
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      XLSX.writeFile(workbook, `GMAO_Export_OT_${timestamp}.xlsx`);
    },
    error: (err) => {
      console.error('Erreur chargement préventifs pour export :', err);
      // Export correctifs seuls en fallback
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dataCorrectifs);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'OT Correctifs');
      XLSX.writeFile(workbook, `GMAO_Export_OT_${timestamp}.xlsx`);
    }
  });
}

  openCreateModal(): void { this.router.navigate(['/ot-correctif/new']); }
  goToDetail(ot: any): void { this.router.navigate(['/ot-correctif/details', ot.id]); }
  goToEdit(ot: any): void   { this.router.navigate(['/ot-correctif', ot.id, 'edit']); }
}