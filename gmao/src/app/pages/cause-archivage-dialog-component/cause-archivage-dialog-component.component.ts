
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Equipement } from '../../models/equipement.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-cause-archivage-dialog-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './cause-archivage-dialog-component.component.html',
  styleUrls: ['./cause-archivage-dialog-component.component.css']
})
export class CauseArchivageDialogComponent {
  cause: string = '';

  constructor(
    public dialogRef: MatDialogRef<CauseArchivageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { equipement: Equipement }
  ) {}

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    this.dialogRef.close(this.cause); // renvoie la cause au component parent
  }
}
