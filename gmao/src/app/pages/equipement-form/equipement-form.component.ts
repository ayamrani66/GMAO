import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FileUploadComponent } from '../../modules/upload-file/upload-file.component';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-equipement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent],
  templateUrl: './equipement-form.component.html',
  styleUrls: ['./equipement-form.component.css']
})
export class EquipementFormComponent implements OnInit {
  // ===== STATE =====
  savedEquipementId?: number;
  isEdit = false;
  errorMessage = '';
  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  // ===== DONNÉES =====
  equipement: any = {
    codeEquipement:  '',
    codeParent:      '',
    libelle:         '',
    niveau:          1,
    localisation:    '',
    compteur:        null,
    criticite:       null,
    dateInstallation: new Date().toISOString().split('T')[0]
  };

  criticites = ['Faible', 'Moyenne', 'Elevee'];

  codeExists     = false;
  codeChecking   = false;
  parentExists   = true; 
  parentChecking = false;
  submitted = false;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient
  ) {}

  // ===== VALIDATION DYNAMIQUE =====
  get formValide(): boolean {
    return !!this.equipement.codeEquipement?.trim() &&
           (!this.codeExists || this.isEdit) &&
           !!this.equipement.libelle?.trim() &&
           (!this.equipement.codeParent || (this.parentExists && !!this.equipement.niveau));
  }

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.isEdit = true;
    this.http.get<any>(`${environment.apiUrl}/equipements/${id}`)
      .subscribe({
        next: (data) => {
          this.equipement = data;

          // Normalisation du format de date pour l'input type="date"
          if (this.equipement.dateInstallation) {
            this.equipement.dateInstallation = this.equipement.dateInstallation.substring(0, 10);
          } else {
            this.equipement.dateInstallation = new Date().toISOString().split('T')[0];
          }

          if (this.equipement.codeParent) {
            this.checkParentExists(this.equipement.codeParent);
          }
        },
        error: () => this.errorMessage = 'Impossible de charger l\'équipement.'
      });
  } else {
    this.equipement.dateInstallation = new Date().toISOString().split('T')[0];
  }
}

  // ===== HANDLERS AUTOMATIQUES =====

  // Gère la saisie du code, calcule le niveau et extrait le parent automatiquement
  onCodeChange(val: string): void {
    const cleanCode = val ? val.toUpperCase().trim() : '';
    this.equipement.codeEquipement = cleanCode;
    this.codeExists = false;

    if (!cleanCode) {
      this.equipement.niveau = 1;
      this.equipement.codeParent = '';
      this.parentExists = true;
      return;
    }

    // 1. Découpage par les tirets pour gérer l'arborescence structurelle
    const segments = cleanCode.split('-');
    
    // 2. Le niveau correspond au nombre de segments
    this.equipement.niveau = segments.length;

    // 3. Extraction et vérification automatique du Code Parent
    if (segments.length > 1) {
      const parentCalculated = segments.slice(0, -1).join('-');
      this.equipement.codeParent = parentCalculated;
      this.checkParentExists(parentCalculated);
    } else {
      this.equipement.codeParent = '';
      this.parentExists = true; // Pas de parent requis au niveau 1
    }

    // 4. Vérification de l'unicité du code équipement lui-même (seulement si création)
    if (!this.isEdit && cleanCode.length >= 2) {
      this.codeChecking = true;
      this.http.get<boolean>(`${environment.apiUrl}/equipements/exists/${cleanCode}`)
        .subscribe({
          next: (exists) => { this.codeExists = exists; this.codeChecking = false; },
          error: ()      => { this.codeChecking = false; }
        });
    }
  }

  // Vérifie si le parent extrait existe bel et bien dans la base de données
  private checkParentExists(codeParent: string): void {
    this.parentChecking = true;
    this.http.get<boolean>(`${environment.apiUrl}/equipements/exists/${codeParent}`)
      .subscribe({
        next: (exists) => { 
          this.parentExists = exists; 
          this.parentChecking = false; 
        },
        error: () => { 
          this.parentExists = false; 
          this.parentChecking = false; 
        }
      });
  }

  // ===== SAUVEGARDE =====
  save(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Nettoyage préliminaire
    if (this.equipement.codeEquipement) {
      this.equipement.codeEquipement = this.equipement.codeEquipement.trim();
    }
    if (this.equipement.libelle) {
      this.equipement.libelle = this.equipement.libelle.trim();
    }

    // ── Validations strictes ──
    if (!this.equipement.codeEquipement) {
      this.errorMessage = 'Le code équipement est obligatoire.'; return;
    }
    if (!this.equipement.libelle) {
      this.errorMessage = 'Le libellé est obligatoire.'; return;
    }
    if (this.codeExists && !this.isEdit) {
      this.errorMessage = 'Ce code équipement existe déjà en base de données.'; return;
    }
    if (this.equipement.codeParent && !this.parentExists) {
      this.errorMessage = `Structure invalide : Le parent "${this.equipement.codeParent}" n'existe pas. Créez-le d'abord.`; return;
    }
    if (!this.formValide) return;

    // Dates de sécurité
    if (!this.equipement.dateInstallation) {
      this.equipement.dateInstallation = new Date().toISOString().split('T')[0];
    }

    const id = this.route.snapshot.paramMap.get('id');
    const request = this.isEdit
      ? this.http.put<any>(`${environment.apiUrl}/equipements/${id}`, this.equipement)
      : this.http.post<any>(`${environment.apiUrl}/equipements`, this.equipement);

    request.subscribe({
      next: (res) => {
        if (!this.isEdit && this.fileUpload) {
          this.fileUpload.equipementId = res.id;
          this.fileUpload.flushPendingFiles();
        }
        setTimeout(() => {
          this.router.navigate(['/equipements']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Une erreur est survenue lors de l\'enregistrement.';
      }
    });
  }

  // ===== NAVIGATION =====
  annuler(): void {
    //this.router.navigate(['/equipements']);
    if(this.isEdit){
      this.router.navigate(['/equipements']);
    }
    else{
      this.router.navigate(['/modules']);
    }
  }
}