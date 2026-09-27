import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any = null;
  demandes: any[] = [];
  ordres: any[] = [];
  activeTab: 'di' | 'ot' = 'di';

  // ===== MODAL =====
  showEditModal = false;
  saving = false;
  editSuccess = '';
  editError = '';
  formTouched = false;

  editForm = {
    nomComplet: '',
    telephone: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // ===== PASSWORD =====
  showOldPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;

  pwdStrength: 'weak' | 'medium' | 'strong' | '' = '';
  pwdScore = 0;
  pwdCriteria = { length: false, uppercase: false, number: false, special: false };
  pwdErrors = { oldRequired: false, sameAsOld: false };

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

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileService.getMe().subscribe({
      next: (u) => this.user = u,
      error: () => this.user = this.authService.getCurrentUser()
    });
    this.loadData();
  }

  // Dans profile.component.ts, getter utile
get roleTechnicienLabel(): string {
  return this.user?.roleTechnicien ?? null;
}

  get initials(): string {
    return this.user?.nomComplet
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() ?? '?';
  }

  loadData(): void {
    this.profileService.getMyDemandes().subscribe({ next: d => this.demandes = d, error: () => {} });
    this.profileService.getMyOrdres().subscribe({ next: o => this.ordres = o, error: () => {} });
  }

  setTab(tab: 'di' | 'ot'): void { this.activeTab = tab; }

  // ===== MODAL =====
  openEditModal(): void {
    this.editForm = {
      nomComplet:      this.user?.nomComplet ?? '',
      telephone:       this.user?.telephone ?? '',
      oldPassword:     '',
      newPassword:     '',
      confirmPassword: ''
    };
    this.pwdCriteria  = { length: false, uppercase: false, number: false, special: false };
    this.pwdErrors    = { oldRequired: false, sameAsOld: false };
    this.pwdStrength  = '';
    this.pwdScore     = 0;
    this.formTouched  = false;
    this.editSuccess  = '';
    this.editError    = '';
    this.showEditModal = true;
  }

  closeEditModal(): void { this.showEditModal = false; }

  // ===== PASSWORD LOGIC =====
  onOldPwdChange(): void {
    this.pwdErrors.oldRequired = false;
  }

  onNewPwdChange(value: string): void {
    this.pwdCriteria.length    = value.length >= 8;
    this.pwdCriteria.uppercase = /[A-Z]/.test(value);
    this.pwdCriteria.number    = /\d/.test(value);
    this.pwdCriteria.special   = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    this.pwdScore = Object.values(this.pwdCriteria).filter(Boolean).length;

    if (this.pwdScore <= 1)      this.pwdStrength = 'weak';
    else if (this.pwdScore <= 3) this.pwdStrength = 'medium';
    else                         this.pwdStrength = 'strong';

    // Vérifier si identique à l'ancien
    this.pwdErrors.sameAsOld =
      !!(this.editForm.oldPassword && value && this.editForm.oldPassword === value);
  }

  get isNewPwdValid(): boolean {
    return Object.values(this.pwdCriteria).every(Boolean);
  }

  
  // ===== SAVE =====
  saveProfile(): void {
    this.formTouched = true;
    this.editSuccess = '';
    this.editError   = '';

    // Validation nom
    if (!this.editForm.nomComplet.trim()) return;

    // Validation mot de passe si renseigné
    if (this.editForm.newPassword) {
      if (!this.editForm.oldPassword) {
        this.pwdErrors.oldRequired = true;
        return;
      }
      if (!this.isNewPwdValid) {
        this.editError = 'Le nouveau mot de passe ne respecte pas les critères de sécurité.';
        return;
      }
      if (this.editForm.newPassword !== this.editForm.confirmPassword) {
        this.editError = 'Les mots de passe ne correspondent pas.';
        return;
      }
      if (this.pwdErrors.sameAsOld) {
        this.editError = 'Le nouveau mot de passe doit être différent de l\'ancien.';
        return;
      }
    }

    this.saving = true;

    const payload: any = {
      nomComplet: this.editForm.nomComplet.trim(),
      telephone:  this.editForm.telephone.trim()
    };

    if (this.editForm.newPassword) {
      payload.oldPassword = this.editForm.oldPassword;
      payload.newPassword = this.editForm.newPassword;
    }

    this.profileService.updateProfile(payload).subscribe({
      next: (updated) => {
        this.saving = false;
        this.editSuccess = 'Profil mis à jour avec succès !';

        // Mettre à jour localStorage + user local
        localStorage.setItem('nomComplet', updated.nomComplet);
        this.user = { ...this.user, ...updated };

        // Réinitialiser les champs mot de passe
        this.editForm.oldPassword     = '';
        this.editForm.newPassword     = '';
        this.editForm.confirmPassword = '';
        this.pwdStrength = '';
        this.pwdScore    = 0;
        this.pwdCriteria = { length: false, uppercase: false, number: false, special: false };
      },
      error: (err) => {
        this.saving = false;
        this.editError = err?.error?.message || 'Une erreur est survenue.';
      }
    });
  }

  // ===== BADGES =====
  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      PENDING:     'badge-pending',
      SUPERVISEUR: 'badge-orange', 
      MANAGER:     'badge-orange',
      RESPONSABLE: 'badge-orange',
    };
    return map[role] ?? 'badge-pending';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      PENDING:     'En attente',
      SUPERVISEUR: 'Superviseur',
      MANAGER:     'Manager',
      RESPONSABLE: 'Responsable',
    };
    return map[role] ?? role;
  }

  getDiStatutClass(statut: string): string {
     return ({ Cree: 'badge-grey', Validee: 'badge-green', Rejetee: 'badge-red' } as any)[statut] ?? 'badge-grey';
  }
    formatStatutDi(s: string): string {
  return ({
    Cree:    'Créée',
    Validee: 'Validée',
    Rejetee: 'Rejetée'
  } as any)[s] ?? s;
}


  getOtStatutClass(statut: string): string {
    return ({
    Cree:                   'badge-grey',
    En_cours_planification: 'badge-blue',
    Planifie:               'badge-orange',
    En_cours_preparation:   'badge-blue',
    Prepare:                'badge-orange',
    Termine:                'badge-green',
    Cloture:                'badge-grey'
  } as any)[statut] ?? 'badge-grey';
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
 getPrioriteClass(p: string): string {
    return ({ Urgente: 'badge-red', Haute: 'badge-orange', Normale: 'badge-blue', Basse: 'badge-grey' } as any)[p] ?? 'badge-grey';
  }
  goToDetail(ot: any): void { 
    if (ot.typeOT === 'Correctif'){
this.router.navigate(['/ot-correctif/details', ot.id]);
    }
      else if (ot.typeOT === 'Preventif'){
        this.router.navigate(['/ot-preventif/details', ot.id]);
      }
     }
  goToDetailDi(di: any): void {
  this.router.navigate(['/di/details', di.id]); 
  }
}