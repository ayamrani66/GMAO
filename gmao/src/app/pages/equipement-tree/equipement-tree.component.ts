import { Component, Input, OnChanges, SimpleChanges, ViewContainerRef, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipement } from '../../models/equipement.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CauseArchivageDialogComponent } from '../cause-archivage-dialog-component/cause-archivage-dialog-component.component';
import { EquipementService } from '../../services/equipement.service';
import { RoleService } from '../../services/role.service';

import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-equipement-tree',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule],
  templateUrl: './equipement-tree.component.html',
  styleUrls: ['./equipement-tree.component.css']
})
export class EquipementTreeComponent implements OnChanges {

  @Input() equipement!: Equipement;
  @Input() allEquipements: Equipement[] = [];
  @Input() searchTerm: string = '';

  @ViewChild('menu') menu!: TemplateRef<any>;

  // C'est cette variable locale qui va booster tes performances
  filteredChildren: Equipement[] = [];
  private overlayRef!: OverlayRef;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private equipementService: EquipementService,
    private overlay: Overlay,
    private vcr: ViewContainerRef,
    public roleService: RoleService
  ) {}

  // Se déclenche uniquement quand les @Input() changent (grâce au debounce du parent)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allEquipements'] || changes['searchTerm'] || changes['equipement']) {
      this.computeChildren();
    }
  }

  // Calcule et met en cache les enfants visibles
  private computeChildren(): void {
    const directChildren = this.allEquipements.filter(
      e => e.codeParent === this.equipement.codeEquipement && !e.archive
    );

    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.filteredChildren = directChildren;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredChildren = directChildren.filter(e => this.isVisible(e, term));
  }

  private isVisible(e: Equipement, term: string): boolean {
    if (e.codeEquipement?.toLowerCase().includes(term) ||
        e.libelle?.toLowerCase().includes(term)) {
      return true;
    }
    // Visible si un de ses descendants matche
    return this.allEquipements
      .filter(child => child.codeParent === e.codeEquipement && !child.archive)
      .some(child => this.isVisible(child, term));
  }

  toggle(): void {
    this.equipement.expanded = !this.equipement.expanded;
  }

  goToHistorique() {
    if (this.equipement.id) {
      this.router.navigate(['/equipements', this.equipement.id, 'historique']);
    }
  }

  onRightClick(event: MouseEvent, equipement: Equipement) {
    event.preventDefault();

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo({ x: event.clientX, y: event.clientY })
        .withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top'
        }]),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    this.overlayRef.backdropClick().subscribe(() => this.overlayRef.dispose());
    this.overlayRef.attach(new TemplatePortal(this.menu, this.vcr));
  }

  modifierEquipement(equipement: Equipement) {
    if (this.overlayRef) this.overlayRef.dispose();
    this.router.navigate(['/equipements/edit', equipement.id]);
  }

  archiverEquipement(equipement: Equipement) {
    if (this.overlayRef) this.overlayRef.dispose();
    const dialogRef = this.dialog.open(CauseArchivageDialogComponent, {
      width: '300px',
      data: { equipement }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        equipement.archive = true;
        equipement.causeArchivage = result;
        this.equipementService.update(equipement).subscribe(() => {
          alert('Équipement archivé avec succès !');
          // Optionnel : Tu peux émettre un événement vers le parent ici si besoin de rafraîchir la liste complète
        });
      }
    });
  }
}