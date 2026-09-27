import { Component, OnInit } from '@angular/core';
import { Equipement } from '../../../models/equipement.model';
import { EquipementService } from '../../../services/equipement.service';
import { CommonModule } from '@angular/common';
import { EquipementTreeComponent } from '../../../pages/equipement-tree/equipement-tree.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-equipement-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EquipementTreeComponent],
  templateUrl: './equipement-list.component.html',
  styleUrls: ['./equipement-list.component.css']
})
export class EquipementListComponent implements OnInit {

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  equipements: Equipement[] = [];
  racines: Equipement[] = [];
  archivedEquipements: Equipement[] = [];

  showArchives: boolean = false; // true = afficher les archives
  searchTerm: string = '';
  filteredEquipements: Equipement[] = [];

  constructor(private equipementService: EquipementService, private router: Router) {}

  ngOnInit(): void {
// 1. Récupérer l'ancien terme de recherche sauvegardé s'il existe
this.searchTerm = localStorage.getItem('equipement_search_term') || '';

// 2. Initialiser le flux de recherche réactif (Debounce pour la performance)
this.searchSubscription = this.searchSubject.pipe(
  debounceTime(300),        // Attend 300ms de pause dans la saisie avant de filtrer
  distinctUntilChanged()    // N'exécute le filtre que si le texte a changé
).subscribe(term => {
  this.searchTerm = term;
  localStorage.setItem('equipement_search_term', term); // Sauvegarder la recherche
  this.filterEquipements();
});

// 3. Charger les données du serveur
this.loadEquipements();
}

loadEquipements() {
  this.equipementService.getAll().subscribe(data => {
    // 1. On charge tous les équipements
    this.equipements = data.map(e => ({ ...e, expanded: false }));
    
    // 2. Si un terme était sauvegardé en mémoire locale, on applique le filtre DIRECTEMENT
    if (this.searchTerm && !this.showArchives) {
      this.filterEquipements();
    } else {
      // Sinon, on affiche la liste normale par défaut
      this.updateLists();
    }
  });
}
onSearchChange(event: Event) {
const value = (event.target as HTMLInputElement).value;
this.searchSubject.next(value); // Transmet la valeur au Subject RxJS
}

updateLists() {
if (this.showArchives) {
this.archivedEquipements = this.equipements.filter(e => e.archive);
} else {
this.racines = this.equipements.filter(e => !e.codeParent && !e.archive);
}
}

  filterEquipements() {
const term = this.searchTerm.toLowerCase().trim();

if (!term) {
  this.equipements.forEach(e => e.expanded = false);
  this.updateLists();
  return;
}

// 1. Trouver les équipements qui matchent
const matches = this.equipements.filter(e =>
  !e.archive && (
    e.codeEquipement?.toLowerCase().includes(term) ||
    e.libelle?.toLowerCase().includes(term)
  )
);

// 2. Collecter tous les codes visibles (match + leurs ancêtres)
const visibleCodes = new Set<string>();

matches.forEach(match => {
  let current: Equipement | undefined = match;
  while (current) {
    visibleCodes.add(current.codeEquipement);
    current = this.equipements.find(p => p.codeEquipement === current!.codeParent);
  }
});

// 3. Expand uniquement les ancêtres
this.equipements.forEach(e => {
  if (visibleCodes.has(e.codeEquipement)) {
    const hasVisibleChild = this.equipements.some(
      child => child.codeParent === e.codeEquipement && visibleCodes.has(child.codeEquipement)
    );
    e.expanded = hasVisibleChild;
  } else {
    e.expanded = false;
  }
});

// 4. Afficher seulement les racines visibles
this.racines = this.equipements.filter(e =>
  !e.codeParent && !e.archive && visibleCodes.has(e.codeEquipement)
);
}

  goToAdd() {
    this.router.navigate(['/equipements/add']); 
  }

  toggleArchives() {
    this.showArchives = !this.showArchives;
    this.updateLists();
  }

  dearchiver(equipement: Equipement) {
    equipement.archive = false;
    equipement.causeArchivage = '';

    this.equipementService.update(equipement).subscribe(() => {
      alert(`Équipement ${equipement.codeEquipement} restauré !`);
      this.loadEquipements();
    });
  }
  ngOnDestroy(): void {
if (this.searchSubscription) {
this.searchSubscription.unsubscribe();
}
}
}