import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtService } from '../../services/ot.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FileUploadComponent } from '../../modules/upload-file/upload-file.component';

interface EquipementNode {
  id: number;
  codeEquipement: string;
  libelle: string;
  parentId: number | null;
   parent?: EquipementNode | null;
  children: EquipementNode[];
  isExpanded?: boolean; // Pour l'affichage
  isVisible?: boolean;  // Pour la recherche
  level: number;
}

@Component({
  selector: 'app-ot-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent],
  templateUrl: './ot-form.component.html',
  styleUrls: ['./ot-form.component.css']
})
export class OtFormComponent implements OnInit {

  savedOtId?: number;
  editMode = false;
  editOtId?: number;
  submitted = false;

  isCorrectif = false;

  nodes: EquipementNode[] = [];      // L'arbre complet
flatNodes: EquipementNode[] = [];  // Liste à plat pour la recherche simple
showTree = false;

  // ── Données équipements ──
  zones: any[] = [];               // niveau 1 (sans parent)
  enfantsZone: any[] = [];         // équipements de la zone sélectionnée
  sousEquipements: any[] = [];     // sous-équipements de l'équipement sélectionné dans l'action

  allEquipements: any[] = [];       // Liste complète brute
  equipementsAplat: any[] = [];     // Liste formatée pour l'affichage (avec indentation)
  equipementsFiltres: any[] = [];   // Liste filtrée par la recherche
  showEquipementDropdown = false;
  searchEquipement = '';

  // Pour les actions
  searchActionEquipement = '';
  showActionEquipementDropdown = false;
  actionEquipementsFiltres: any[] = [];

  // ── OT principal ──
  ot: {
    equipementId: number | null;   // zone sélectionnée
    titre: string;
    natureAnomalie: string | null;
    priorite: string;
    affectationTechnicien: string | null;
    actionsStructurees: {
      equipementId: number | null;
      equipementLabel: string;
      sousEquipementId: number | null;
      sousEquipementLabel: string;
      action: string;
      mode: 'Marche' | 'Arret' | '';
      affectationTechnicien: string | null;
      natureAnomalie: string | null;
      moyenControle: string;
      estFaite?: boolean;
    }[];
  } = {
    equipementId: null,
    titre: '',
    natureAnomalie: null,
    priorite: 'Normale',
    affectationTechnicien: null,
    actionsStructurees: []
  };

  // ── Action en cours de saisie ──
  nouvelleActionStructuree: {
    equipementId: number | null;
    equipementLabel: string;
    sousEquipementId: number | null;
    sousEquipementLabel: string;
    action: string;
    mode: 'Marche' | 'Arret' | '';
    affectationTechnicien: string | null;
    moyenControle: string;
    estFaite?: boolean;
    natureAnomalie: string | null;
  } = this.actionVide();

  // ── Sous-équipements pour l'action en cours ──
  sousEquipementsAction: any[] = [];

  priorites = ['Urgente', 'Haute', 'Normale', 'Basse'];

  naturesAnomalie = [
    { value: 'Mecanique',     label: 'Mécanique' },
    { value: 'Hydraulique',   label: 'Hydraulique' },
    { value: 'Electrique',    label: 'Électrique' },
    { value: 'Thermique',     label: 'Thermique' },
    { value: 'Chaudronnerie', label: 'Chaudronnerie' },
    { value: 'Pnematique',    label: 'Pneumatique' },
    { value: 'Inspection',    label: 'Inspection' },
    { value: 'Lubrification', label: 'Lubrification' },
    { value: 'Graissage',     label: 'Graissage' },
    { value: 'Instrumentation', label: 'Instrumentation' },
    { value: 'Automatisme',   label: 'Automatisme' },
    { value: 'Autre',         label: 'Autre' }
  ];

  rolesTechnicien = [
    { value: 'GRA',     label: 'Graisseur',         icon: '🛢️' },
    { value: 'MEC',     label: 'Mécanicien',        icon: '🔧' },
    { value: 'ELEC',    label: 'Électricien',       icon: '⚡' },
    { value: 'HYDR',    label: 'Hydraulicien',      icon: '💧' },
    { value: 'SOUD',    label: 'Soudeur',           icon: '🔥' },
    { value: 'ELECMEC', label: 'Électromécanicien', icon: '⚙️' },
    { value: 'AUTO',    label: 'Automaticien',      icon: '🤖' },
    { value: 'INSPE',   label: 'Inspecteur',        icon: '🕵️' },
    { value: 'INSMEC',  label: 'Inspecteur mécanique', icon: '🔍' },
    { value: 'EXEC',    label: 'Exécutant',         icon: '👷' },
    { value: 'CHAUD',   label: 'Chaudronnier',      icon: '🔨' },
    { value: 'INSTR',   label: 'Instrumentiste',    icon: '📐' },
    { value: 'TUY',     label: 'Tuyautier',         icon: '🔧' },
    { value: 'PROD',    label: 'Production',        icon: '🏭' },
    { value: 'INSHYD',  label: 'Inspecteur hydraulique', icon: '💧' }
  ];

  searchZone = '';
showZoneDropdown = false;
zonesFiltres: any[] = [];

  get formValide(): boolean {
    return !!this.ot.equipementId &&
           !!this.ot.titre?.trim() &&
           !!this.ot.priorite;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private otService: OtService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const urlSegments = this.route.snapshot.url.map(s => s.path);
    const isEditRoute = urlSegments.includes('edit');

     this.isCorrectif = this.router.url.includes('correctif');

    this.loadZones();
    this.loadAllEquipements();

    if (isEditRoute) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.editMode = true;
        this.editOtId = Number(id);
        this.loadOtForEdit(this.editOtId);
      }
    }
  }
// ===== CHARGEMENT ET FILTRAGE DES ZONES =====

loadZones(): void {
  this.http.get<any[]>(`${environment.apiUrl}/equipements/zones`).subscribe({
    next: (data) => {
      // 🛡️ SÉCURITÉ : On ne garde QUE les équipements racine (niveau === 1 ou sans codeParent) et non archivés
      this.zones = data.filter(z => !z.archive && (z.niveau === 1 || !z.codeParent));
      
      // Initialise la liste filtrée pour le premier clic dans l'input
      this.zonesFiltres = [...this.zones];

      // Si on est en mode édition, on reconstruit le libellé de l'input de recherche
      if (this.editMode && this.ot.equipementId) {
        const zoneActive = this.zones.find(z => z.id === this.ot.equipementId);
        if (zoneActive) {
          this.searchZone = `${zoneActive.codeEquipement} — ${zoneActive.libelle}`;
        }
      }
    },
    error: () => console.error('Erreur lors du chargement des zones')
  });
}

loadAllEquipements(): void {

  this.http
    .get<any[]>(`${environment.apiUrl}/equipements`)
    .subscribe(data => {

      const actifs = data.filter(e => !e.archive);

      this.flatNodes = actifs;

      this.nodes = this.buildTree(actifs);

      console.log(this.nodes);

      if (this.editMode && this.ot.equipementId) {

        const found = actifs.find(e => e.id === this.ot.equipementId);

        if (found) {
          this.searchEquipement =
            `${found.codeEquipement} - ${found.libelle}`;
        }
      }

    });

}
buildTree(list: any[]): EquipementNode[] {

  const map = new Map<string, EquipementNode>();
  const roots: EquipementNode[] = [];

  // Création des noeuds
  for (const item of list) {
    map.set(item.codeEquipement, {
      ...item,
      children: [],
      isExpanded: false,
      isVisible: true,
      level: 0,
      parent: null
    });
  }

  // Construction de l'arbre + liaison vers le parent
  for (const item of list) {

    const node = map.get(item.codeEquipement)!;

    if (!item.codeParent) {
      roots.push(node);
    } else {

      const parent = map.get(item.codeParent);

      if (parent) {
        node.level = parent.level + 1;
        node.parent = parent;          // ✅ on garde le lien vers le parent
        parent.children.push(node);
      } else {
        roots.push(node);
      }

    }
  }

  return roots;
}
private getRootZone(node: EquipementNode): EquipementNode {
  let current = node;
  while (current.parent) {
    current = current.parent;
  }
  return current;
}

toggleNode(node: EquipementNode, event: Event): void {
  event.stopPropagation(); // Empêche la sélection quand on clique juste sur la flèche
  node.isExpanded = !node.isExpanded;
}

selectNode(node: EquipementNode): void {

  // 1. La "Zone" de l'OT = toujours la racine (niveau 0), quel que soit le niveau cliqué
  const zoneRacine = this.getRootZone(node);
  this.ot.equipementId = zoneRacine.id;
  this.searchEquipement = `${node.codeEquipement} - ${node.libelle}`;

  // 2. Pré-remplissage de l'action en cours selon le niveau du nœud sélectionné
  if (node.level === 0) {
    // La zone elle-même est sélectionnée
    this.nouvelleActionStructuree.equipementLabel = node.libelle;
    this.nouvelleActionStructuree.sousEquipementLabel = '';
    this.sousEquipementsFiltres = node.children ?? [];

  } else if (node.level === 1) {
    // Équipement sélectionné (ex: "Hangar PAF")
    this.nouvelleActionStructuree.equipementLabel = node.libelle;
    this.nouvelleActionStructuree.sousEquipementLabel = '';
    // Sous-équipements possibles pour l'action = enfants de ce nœud
    this.sousEquipementsFiltres = node.children ?? [];

  } else {
    // Sous-équipement sélectionné (ex: "Charpente métallique")
    const parent = node.parent!;
    this.nouvelleActionStructuree.equipementLabel = parent.libelle;
    this.nouvelleActionStructuree.sousEquipementLabel = node.libelle;
    // "Frères" du sous-équipement choisi = autres enfants du même équipement
    this.sousEquipementsFiltres = parent.children ?? [];
  }

  this.showTree = false;
}

// Recherche simple : si on tape, on filtre les noeuds racine
filterTree(): void {
  this.showTree = true;
  // Optionnel : implémenter un filtrage récursif plus complexe ici
}

// --- Gestionnaires de recherche universels ---

filterEquipements(type: 'principal' | 'action'): void {
  const term = type === 'principal' ? this.searchEquipement.toLowerCase() : this.searchActionEquipement.toLowerCase();
  const list = this.equipementsAplat.filter(e => 
    e.codeEquipement.toLowerCase().includes(term) || 
    e.libelle.toLowerCase().includes(term)
  );

  if (type === 'principal') {
    this.equipementsFiltres = list;
    this.showEquipementDropdown = true;
  } else {
    this.actionEquipementsFiltres = list;
    this.showActionEquipementDropdown = true;
  }
}

selectEquipement(e: any, type: 'principal' | 'action'): void {
  if (type === 'principal') {
    this.ot.equipementId = e.id;
    this.searchEquipement = `${e.codeEquipement} — ${e.libelle}`;
    this.showEquipementDropdown = false;
  } else {
    this.nouvelleActionStructuree.equipementId = e.id;
    this.nouvelleActionStructuree.equipementLabel = e.libelle;
    this.searchActionEquipement = `${e.codeEquipement} — ${e.libelle}`;
    this.showActionEquipementDropdown = false;
  }
}

filterZones(): void {
  this.showZoneDropdown = true;
  const term = this.searchZone ? this.searchZone.toLowerCase().trim() : '';

  // Filtre localement parmi les zones valides de niveau 1
  if (!term) {
    this.zonesFiltres = this.zones.filter(z => !z.archive);
    return;
  }

  this.zonesFiltres = this.zones.filter(z => 
    !z.archive && (
      z.codeEquipement?.toLowerCase().includes(term) ||
      z.libelle?.toLowerCase().includes(term)
    )
  );
}

selectZone(z: any): void {
  this.ot.equipementId = z.id;
  this.searchZone = `${z.codeEquipement} — ${z.libelle}`;
  this.showZoneDropdown = false;
  
  // Déclenche l'affichage des équipements enfants de cette zone
  this.onZoneChange(); 
}

clearZoneSelection(): void {
  this.ot.equipementId = null;
  this.searchZone = '';
  this.zonesFiltres = [...this.zones]; // Réinitialise la liste
  
  // Réinitialise également les listes d'équipements enfants reliées
  this.onZoneChange(); 
}

// Enfants d'une zone
onZoneChange(): void {
  this.enfantsZone = [];
  this.sousEquipementsAction = [];
  this.nouvelleActionStructuree = this.actionVide();
  if (!this.ot.equipementId) return;

  // ✅ URL corrigée : /enfants/{id}
  this.http.get<any[]>(`${environment.apiUrl}/equipements/enfants/${this.ot.equipementId}`)
    .subscribe({ next: (data) => this.enfantsZone = data });
}

searchSousEquipement = '';
showSousEquipementDropdown = false;
sousEquipementsFiltres: any[] = [];


// 2. Gestionnaires de recherche pour l'équipement de l'action
filterActionEquipements(): void {
  this.showActionEquipementDropdown = true;
  const term = this.searchActionEquipement ? this.searchActionEquipement.toLowerCase().trim() : '';

  // Sécurité anti-archives
  const valides = this.enfantsZone.filter(e => !e.archive);

  if (!term) {
    this.actionEquipementsFiltres = valides;
    return;
  }
  this.actionEquipementsFiltres = valides.filter(e =>
    e.codeEquipement?.toLowerCase().includes(term) ||
    e.libelle?.toLowerCase().includes(term)
  );
}

selectActionEquipement(e: any): void {
  this.nouvelleActionStructuree.equipementId = e.id;
  this.searchActionEquipement = `${e.codeEquipement} — ${e.libelle}`;
  this.showActionEquipementDropdown = false;
  
  // Charge automatiquement les sous-équipements via ton API
  this.onEquipementActionChange();
  
  // Réinitialise le champ sous-équipement enfant en cascade
  this.clearSousEquipementSelection();
}

clearActionEquipementSelection(): void {
  this.nouvelleActionStructuree.equipementId = null;
  this.nouvelleActionStructuree.equipementLabel = '';
  this.searchActionEquipement = '';
  this.actionEquipementsFiltres = this.enfantsZone.filter(e => !e.archive);
  this.clearSousEquipementSelection();
  this.onEquipementActionChange();
}


// 3. Gestionnaires de recherche pour le sous-équipement de l'action
filterSousEquipements(): void {
  if (!this.nouvelleActionStructuree.equipementId) return;
  this.showSousEquipementDropdown = true;
  const term = this.searchSousEquipement ? this.searchSousEquipement.toLowerCase().trim() : '';

  const valides = this.sousEquipementsAction.filter(s => !s.archive);

  if (!term) {
    this.sousEquipementsFiltres = valides;
    return;
  }
  this.sousEquipementsFiltres = valides.filter(s =>
    s.codeEquipement?.toLowerCase().includes(term) ||
    s.libelle?.toLowerCase().includes(term)
  );
}

selectSousEquipement(s: any | null): void {
  if (s) {
    this.nouvelleActionStructuree.sousEquipementId = s.id;
    this.searchSousEquipement = `${s.codeEquipement} — ${s.libelle}`;
  } else {
    this.nouvelleActionStructuree.sousEquipementId = null;
    this.searchSousEquipement = '';
  }
  this.showSousEquipementDropdown = false;
  this.onSousEquipementActionChange();
}

clearSousEquipementSelection(): void {
  this.nouvelleActionStructuree.sousEquipementId = null;
  this.nouvelleActionStructuree.sousEquipementLabel = '';
  this.searchSousEquipement = '';
  this.sousEquipementsFiltres = this.sousEquipementsAction.filter(s => !s.archive);
  this.onSousEquipementActionChange();
}


onEquipementActionChange(): void {
  this.nouvelleActionStructuree.sousEquipementId = null;
  this.nouvelleActionStructuree.sousEquipementLabel = '';
  this.sousEquipementsAction = [];
  this.sousEquipementsFiltres = []; // <--- Nettoyage
  if (!this.nouvelleActionStructuree.equipementId) return;

  const eq = this.enfantsZone.find(e => e.id === this.nouvelleActionStructuree.equipementId);
  this.nouvelleActionStructuree.equipementLabel = eq ? `${eq.libelle}` : '';

  this.http.get<any[]>(`${environment.apiUrl}/equipements/enfants/${this.nouvelleActionStructuree.equipementId}`)
    .subscribe({ 
      next: (data) => {
        this.sousEquipementsAction = data;
        this.sousEquipementsFiltres = data.filter(s => !s.archive); // <--- Remplissage initial
      } 
    });
}

  // ── Dans l'action : quand le sous-équipement est sélectionné ──
  onSousEquipementActionChange(): void {
    const se = this.sousEquipementsAction.find(
      e => e.id === this.nouvelleActionStructuree.sousEquipementId
    );
    this.nouvelleActionStructuree.sousEquipementLabel = se
      ? `${se.libelle}`
      : '';
  }

  // ── Ajouter une action à la liste ──
ajouterActionStructuree(): void {
  const a = this.nouvelleActionStructuree;
  if (!a.equipementLabel?.trim() || !a.action.trim() || !a.mode || !a.affectationTechnicien) return;

  this.ot.actionsStructurees = [...this.ot.actionsStructurees, { ...a }];

  // On garde l'équipement / sous-équipement pour préparer l'action suivante
  // (cas "Action 2" sur un autre sous-équipement du même équipement)
  this.nouvelleActionStructuree = {
    ...this.actionVide(),
    equipementId: a.equipementId,
    equipementLabel: a.equipementLabel,
    sousEquipementId: a.sousEquipementId,
    sousEquipementLabel: a.sousEquipementLabel
  };
}

  supprimerActionStructuree(i: number): void {
    this.ot.actionsStructurees = this.ot.actionsStructurees.filter((_, idx) => idx !== i);
  }

  private actionVide() {
    return {
      equipementId: null as number | null,
      equipementLabel: '',
      sousEquipementId: null as number | null,
      sousEquipementLabel: '',
      action: '',
      mode: '' as 'Marche' | 'Arret' | '',
      affectationTechnicien: null as string | null,
      natureAnomalie: null as string | null,
      moyenControle: '',
      estFaite: false
    };
  }

  loadOtForEdit(id: number): void {
  this.otService.getById(id).subscribe({
    next: (data) => {
      this.ot.titre            = data.titre          ?? '';
      this.ot.natureAnomalie   = data.natureAnomalie  ?? null;
      this.ot.priorite         = data.priorite        ?? 'Normale';
      this.ot.affectationTechnicien = data.affectationTechnicien ?? null;

      if (data.zone?.id) {
        this.ot.equipementId = data.zone.id;
        this.http
          .get<any[]>(`${environment.apiUrl}/equipements/enfants/${data.zone.id}`)
          .subscribe({ next: (enfants) => this.enfantsZone = enfants });
      }

      // ✅ Mapping correct : backend renvoie .equipement (string), pas .equipementLabel
      this.ot.actionsStructurees = (data.actionsStructurees ?? []).map((a: any) => ({
        equipementId:        null,
        equipementLabel:     a.equipement      ?? a.equipementLabel     ?? '',
        sousEquipementId:    null,
        sousEquipementLabel: a.sousEquipement  ?? a.sousEquipementLabel ?? '',
        action:              a.action          ?? '',
        mode:                a.mode            ?? '',
        affectationTechnicien: a.affectationTechnicien ?? null,
        natureAnomalie:      a.natureAnomalie   ?? null,
        moyenControle:       a.moyenControle    ?? '',
        estFaite:            a.estFaite         ?? false
      }));
    },
    error: () => alert('Impossible de charger l\'OT')
  });
}

  // ── Sauvegarder ──
  save(): void {
    this.submitted = true;
    if (!this.formValide) return;

    // Transformer actionsStructurees pour le backend (String, pas ID)
    const payload = {
      ...this.ot,
      typeOT: this.isCorrectif ? 'Correctif' : 'Preventif', 
      actionsStructurees: this.isCorrectif ? [] : this.ot.actionsStructurees.map(a => ({
        equipement: a.equipementLabel || String(a.equipementId),
        sousEquipement: a.sousEquipementLabel || '',
        action: a.action,
        mode: a.mode,
        affectationTechnicien: a.affectationTechnicien,
        moyenControle: a.moyenControle,
        estFaite: a.estFaite ?? false,
        natureAnomalie: a.natureAnomalie 
      }))
    };

    if (this.editMode && this.editOtId) {
      this.otService.update(this.editOtId, payload).subscribe({
        next: () => this.router.navigate(['/ot-preventif']),
        
        error: (err) => alert('Erreur : ' + (err?.error?.message || err.message))
      });
    } else if (this.isCorrectif) {
          this.router.navigate(['/ot']);
        } 
    else {
      this.otService.create(payload).subscribe({
        next: (res) => {
          this.savedOtId = res.id;
          // Ne pas naviguer → afficher le composant upload
        },
        error: (err) => alert('Erreur : ' + (err?.error?.message || err.message))
      });
    }
  }

  annuler(): void {
    this.router.navigate(['/ot-preventif']);
    if(this.isCorrectif) {
      this.router.navigate(['/ot']);
    }
  }

  getRoleTechnicienLabel(value: string): string {
    return this.rolesTechnicien.find(r => r.value === value)?.label ?? value;
  }
}