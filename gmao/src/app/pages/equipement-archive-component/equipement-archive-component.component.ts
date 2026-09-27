import { Component, OnInit } from '@angular/core';
import { Equipement } from '../../models/equipement.model';
import { EquipementService } from '../../services/equipement.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { CauseArchivageDialogComponent } from '../cause-archivage-dialog-component/cause-archivage-dialog-component.component';

@Component({
  selector: 'app-equipement-archive-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './equipement-archive-component.component.html',
  styleUrl: './equipement-archive-component.component.css'
})

export class EquipementArchiveComponent implements OnInit {

  equipements: Equipement[] = [];

  constructor(private equipementService: EquipementService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadArchived();
  }

  loadArchived() {
    this.equipementService.getArchived().subscribe(data => this.equipements = data);
  }

  dearchiver(equipement: Equipement) {
    // Demande confirmation ou modification de la cause
    const dialogRef = this.dialog.open(CauseArchivageDialogComponent, {
      width: '300px',
      data: { equipement }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        equipement.archive = false;
        equipement.causeArchivage = result;
        this.equipementService.update(equipement).subscribe(() => this.loadArchived());
      }
    });
  }
}
