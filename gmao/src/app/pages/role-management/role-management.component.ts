import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDTO, UserService } from '../../services/user.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {

  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];

  loading = true;
  savingId: number | null = null;
  successId: number | null = null;
  errorMessage = '';

  searchQuery = '';
  filterRole = 'ALL';

  readonly roles = ['PENDING', 'SUPERVISEUR', 'MANAGER', 'RESPONSABLE'];
  readonly filterOptions = ['ALL', 'PENDING', 'SUPERVISEUR', 'MANAGER', 'RESPONSABLE'];

  // Doit refléter l'intégralité de l'enum backend RoleTechnicien
  readonly rolesTechnicien = [
    'GRA',
    'MEC',
    'ELEC',
    'HYDR',
    'SOUD',
    'ELECMEC',
    'AUTO',
    'INSPE',
    'INSMEC',
    'EXEC',
    'INSHYD',
    'PROD',
    'CHAUD',
    'INSTR',
    'TUY'
  ];

  // Libellés affichés à l'écran pour chaque code RoleTechnicien.
  // À ajuster si un intitulé métier ne correspond pas exactement.
  private readonly roleTechnicienLabels: Record<string, string> = {
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
    INSHYD:  'Inspecteur hydraulique',
    PROD:    'Production',
    CHAUD:   'Chaudronnier',
    INSTR:   'Instrumentiste',
    TUY:     'Tuyauteur',
  };

  getRoleTechnicienLabel(code: string): string {
    return this.roleTechnicienLabels[code] ?? code;
  }

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.loading = false;
      }
    });
  }

  pendingRoleTechnicien: Record<number, string> = {};

  applyFilters(): void {
    let result = [...this.users];

    if (this.filterRole !== 'ALL') {
      result = result.filter(u => u.role === this.filterRole);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        u.nomComplet.toLowerCase().includes(q) ||
        u.mail.toLowerCase().includes(q)
      );
    }

    this.filteredUsers = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  assignRole(user: UserDTO, newRole: string): void {
    // Si SUPERVISEUR sans roleTechnicien encore → juste afficher le select, ne pas sauvegarder
    if (newRole === 'SUPERVISEUR' && !this.pendingRoleTechnicien[user.id]) {
      const idx = this.users.findIndex(u => u.id === user.id);
      if (idx !== -1) this.users[idx] = { ...this.users[idx], role: newRole };
      this.applyFilters();
      return;
    }

    this.savingId = user.id;
    this.successId = null;

    const roleTech = newRole === 'SUPERVISEUR' ? this.pendingRoleTechnicien[user.id] : null;

    this.userService.assignRole(user.id, newRole, roleTech).subscribe({
      next: (updated) => {
        const idx = this.users.findIndex(u => u.id === updated.id);
        if (idx !== -1) this.users[idx] = updated;
        delete this.pendingRoleTechnicien[user.id];
        this.applyFilters();
        this.savingId = null;
        this.successId = updated.id;
        setTimeout(() => { this.successId = null; }, 3000);
      },
      error: () => {
        this.savingId = null;
        this.errorMessage = 'Erreur lors de la mise à jour du rôle.';
        setTimeout(() => { this.errorMessage = ''; }, 3000);
      }
    });
  }

  confirmSuperviseur(user: UserDTO): void {
    if (!this.pendingRoleTechnicien[user.id]) return;
    // ⚠ Ne pas passer par assignRole(user, newRole) car user.role est déjà 'SUPERVISEUR'
    // → appeler directement la logique de sauvegarde

    this.savingId = user.id;
    this.successId = null;

    this.userService.assignRole(user.id, 'SUPERVISEUR', this.pendingRoleTechnicien[user.id]).subscribe({
      next: (updated) => {
        const idx = this.users.findIndex(u => u.id === updated.id);
        if (idx !== -1) this.users[idx] = updated;
        delete this.pendingRoleTechnicien[user.id];
        this.applyFilters();
        this.savingId = null;
        this.successId = updated.id;
        setTimeout(() => { this.successId = null; }, 3000);
      },
      error: () => {
        this.savingId = null;
        this.errorMessage = 'Erreur lors de la mise à jour du rôle.';
        setTimeout(() => { this.errorMessage = ''; }, 3000);
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      PENDING:     'badge-pending',
      SUPERVISEUR: 'badge-tech',
      MANAGER:     'badge-manager',
      RESPONSABLE: 'badge-responsable',
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

  countByRole(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  get pendingCount(): number {
    return this.users.filter(u => u.role === 'PENDING').length;
  }

  get totalCount(): number {
    return this.users.length;
  }
}