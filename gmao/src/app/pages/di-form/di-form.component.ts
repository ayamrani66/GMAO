import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiService } from '../../services/di.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FileUploadComponent } from '../../modules/upload-file/upload-file.component';

interface EquipementNode {
  id: number;
  codeEquipement: string;
  libelle: string;
  codeParent: string | null;
  children: EquipementNode[];
  isExpanded?: boolean;
  level: number;
}
@Component({
  selector: 'app-di-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent],
  templateUrl: './di-form.component.html',
  styleUrls: ['./di-form.component.css']
})
export class DiFormComponent implements OnInit {

  editMode   = false;
  editDiId?: number;
  savedDiId?: number;
  equipements: any[] = [];
  errorMessage = '';
  searchEquipement = '';
  equipementsFiltres: any[] = [];

  di: any = {
    equipementId:  null,
    description:   '',
    besoin:        '',
    source:        'Production',
    priorite:      'Normale',
    natureAnomalie: null,
  };

  naturesAnomalie = ['Mecanique', 'Hydraulique', 'Electrique', 'Thermique', 'Chaudronnerie', 'Pnematique', 'Inspection', 'Instrumentation', 'Automatisme', 'Graissage', 'Lubrification', 'Autre'];
  sources         = ['Production', 'Inspection', 'Maintenance'];
  priorites       = ['Urgente', 'Haute', 'Normale', 'Basse'];

  showDropdown = false;

   nodes: EquipementNode[] = [];  
  showTree = false;       

  constructor(
    private route:     ActivatedRoute,
    private router:    Router,
    private diService: DiService,
    private http:      HttpClient
  ) {}

  ngOnInit(): void {
    const urlSegments = this.route.snapshot.url.map(s => s.path);
    const isEditRoute  = urlSegments.includes('edit');

    if (isEditRoute) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.editMode  = true;
        this.editDiId  = Number(id);
        this.loadEquipements(() => this.loadDiForEdit(this.editDiId!));
      }
    } else {
      this.loadEquipements();
    }
  }

  // ── Chargement liste équipements ──────────────────────────────
    loadEquipements(callback?: () => void): void {
    this.http.get<any[]>(`${environment.apiUrl}/equipements`).subscribe({
      next: (data) => {
        this.equipements = data;
        const actifs = data.filter(e => !e.archive);
        this.nodes = this.buildTree(actifs);
        if (callback) callback();
      }
    });
  }

  // Logique de construction de l'arbre
  buildTree(list: any[]): EquipementNode[] {
    const map = new Map<string, EquipementNode>();
    const roots: EquipementNode[] = [];

    for (const item of list) {
      map.set(item.codeEquipement, {
        ...item,
        children: [],
        isExpanded: false,
        level: 0
      });
    }

    for (const item of list) {
      const node = map.get(item.codeEquipement)!;
      if (!item.codeParent) {
        roots.push(node);
      } else {
        const parent = map.get(item.codeParent);
        if (parent) {
          node.level = parent.level + 1;
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    }
    return roots;
  }

  // Gestion des clics sur l'arbre
  toggleNode(node: EquipementNode, event: Event): void {
    event.stopPropagation();
    node.isExpanded = !node.isExpanded;
  }

  selectNode(node: EquipementNode): void {
    this.di.equipementId = node.id;
    this.searchEquipement = `${node.codeEquipement} - ${node.libelle}`;
    this.showTree = false;
  }

  filterTree(): void {
    this.showTree = true;
    // Logique de filtrage simplifiée (optionnelle)
    if (!this.searchEquipement) {
      this.loadEquipements();
    }
  }

  // ── Chargement DI en mode édition ────────────────────────────
  loadDiForEdit(id: number): void {
    this.diService.getById(id).subscribe({
      next: (data) => {
        this.di.equipementId          = data.equipement?.id   ?? null;
        this.di.description           = data.description      ?? '';
        this.di.besoin                = data.besoin           ?? '';
        this.di.source                = data.source           ?? 'Production';
        this.di.priorite              = data.priorite         ?? 'Normale';
        this.di.natureAnomalie        = data.natureAnomalie   ?? null;
        this.di.affectationTechnicien = data.affectationTechnicien ?? null;

        // Pré-remplir le champ de recherche avec l'équipement existant
        if (data.equipement) {
          this.searchEquipement = data.equipement.libelle;
        }
      },
      error: () => this.errorMessage = 'Impossible de charger la DI.'
    });
  }

  // ── Autocomplete équipement ───────────────────────────────────
  filterEquipements(): void {
    this.showDropdown = true;
    const term = this.searchEquipement?.toLowerCase().trim() ?? '';

    if (!term) {
      this.equipementsFiltres = this.equipements.filter(e => !e.archive);
      return;
    }

    this.equipementsFiltres = this.equipements.filter(e =>
      !e.archive && (
        e.codeEquipement?.toLowerCase().includes(term) ||
        e.libelle?.toLowerCase().includes(term)
      )
    );
  }

  selectEquipement(e: any): void {
    this.di.equipementId  = e.id;
    this.searchEquipement = e.libelle;
    this.showDropdown     = false;
  }

  clearSelection(): void {
    this.di.equipementId  = null;
    this.searchEquipement = '';
    this.filterEquipements();
  }

  // ── Validation commune ────────────────────────────────────────
  private valider(): boolean {
    if (!this.di.equipementId) {
      this.errorMessage = 'Veuillez sélectionner un équipement.';
      return false;
    }
    if (!this.di.description?.trim()) {
      this.errorMessage = 'La description est obligatoire.';
      return false;
    }
    if (!this.di.natureAnomalie) {
      this.errorMessage = "La nature de l'anomalie est obligatoire.";
      return false;
    }
    return true;
  }

  // ── Sauvegarde ────────────────────────────────────────────────
  save(): void {
    this.errorMessage = '';

    if (!this.valider()) return;   // ← validation AVANT tout appel HTTP

    if (this.editMode && this.editDiId) {
      // ── Mode ÉDITION ──
      this.diService.update(this.editDiId, this.di).subscribe({
        next: () => this.router.navigate(['/di']),
        error: (err) => this.errorMessage = err?.error?.message || 'Erreur lors de la modification.'
      });
      return;   // ← ne pas continuer vers create()
    }

    // ── Mode CRÉATION ──
    this.diService.create(this.di).subscribe({
      next: (res) => {
        this.savedDiId = res.id;
        this.router.navigate(['/di']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la création.';
      }
    });
  }

  annuler(): void {
    if(this.editMode) {
      this.router.navigate(['/di']);
    } else {this.router.navigate(['/modules']);}
  }
}