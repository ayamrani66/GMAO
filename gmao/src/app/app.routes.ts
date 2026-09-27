import { Routes } from '@angular/router';
import { EquipementListComponent } from './modules/equipement/equipement-list/equipement-list.component';
import { EquipementHistoriqueComponent } from './pages/equipement-historique/equipement-historique.component';
import { LayoutComponent } from './layout/layout/layout.component';
import { EquipementFormComponent } from './pages/equipement-form/equipement-form.component';
import { DiFormComponent } from './pages/di-form/di-form.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { OtFormComponent } from './pages/ot-form/ot-form.component';
import { NotificationsComponent } from './pages/notification/notification.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { RoleManagementComponent } from './pages/role-management/role-management.component';
import { DiListComponent } from './pages/di-list/di-list.component';
import { OtListComponent } from './pages/ot-list/ot-list.component';
import { PdrFormComponent } from './pages/pdr-form/pdr-form.component';
import { PdrListComponent } from './pages/pdr-list/pdr-list.component';
import { PredictionsListComponent } from './pages/prediction-list/prediction-list.component';
import { OtPreventifListComponent } from './pages/ot-preventif-list/ot-preventif-list.component';
import { DiDetailsComponent } from './pages/di-details/di-details.component';
import { OtPreventifDetailComponent } from './pages/ot-preventif-detail/ot-preventif-detail.component';
import { OtCorrectifDetailComponent } from './pages/ot-correctif-detail/ot-correctif-detail.component';
import { ModulesComponent } from './layout/modules/modules.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  // 1. Redirection de la racine vers le Login en premier lieu
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 2. Pages PUBLIQUES (Accessibles sans être connecté)
  { path: 'login', component: LoginComponent },      
  { path: 'register', component: RegisterComponent }, 

  // 3. Routes PROTEGÉES (Nécessitent obligatoirement une connexion)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard()], // Protège TOUTES les sous-routes du layout par défaut
    children: [
      // Page d'accueil après un Login réussi
      { path: 'modules', component: ModulesComponent }, 
      { path: 'dashboard', component: DashboardComponent },

      // Équipements (Protection par rôle en plus de la connexion)
      { 
        path: 'equipements', 
        component: EquipementListComponent,
        canActivate: [authGuard(['RESPONSABLE', 'MANAGER', 'SUPERVISEUR'])] 
      },
      { 
        path: 'equipements/add', 
        component: EquipementFormComponent,
        canActivate: [authGuard(['RESPONSABLE'])] 
      },
      { 
        path: 'equipements/edit/:id', 
        component: EquipementFormComponent,
        canActivate: [authGuard(['RESPONSABLE'])] 
      },
      { path: 'equipements/:id/historique', component: EquipementHistoriqueComponent },
      { path: 'equipements/:id/di', component: DiFormComponent },
      { path: 'equipements/:id/ot', component: OtFormComponent },

      // Demandes d'Intervention (DI)
      { path: 'di', component: DiListComponent },
      { path: 'di/new', component: DiFormComponent },
      { path: 'di/new/:id', component: DiFormComponent },
      { path: 'di/details/:id', component: DiDetailsComponent },
      { path: 'di/:id/edit', component: DiFormComponent },

      // Ordres de Travail (OT)
      { path: 'ot', component: OtListComponent },
      { path: 'ot-preventif/new', component: OtFormComponent },
      { path: 'ot-correctif/new', component: OtFormComponent },
      { path: 'ot-preventif/:id/edit', component: OtFormComponent },
      { path: 'ot-correctif/:id/edit', component: OtFormComponent },
      { path: 'ot-correctif/details/:id', component: OtCorrectifDetailComponent },
      
      // OT Préventif
      { path: 'ot-preventif', component: OtPreventifListComponent },
      { path: 'ot-preventif/details/:id', component: OtPreventifDetailComponent },

      // Pièces de Rechange (PDR)
      { 
        path: 'pieces-rechange', 
        component: PdrListComponent,
        canActivate: [authGuard(['RESPONSABLE', 'MANAGER'])] 
      },
      { 
        path: 'pieces-rechange/nouveau', 
        component: PdrFormComponent,
        canActivate: [authGuard(['RESPONSABLE'])] 
      },
      { 
        path: 'pieces-rechange/:id/modifier', 
        component: PdrFormComponent,
        canActivate: [authGuard(['RESPONSABLE'])] 
      },

      // Autres fonctionnalités
      { path: 'predictions', component: PredictionsListComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'profile', component: ProfileComponent },
      
      // Administration
      { 
        path: 'users', 
        component: RoleManagementComponent, 
        canActivate: [authGuard(['RESPONSABLE'])] 
      },
    ]
  },
  
  // 4. Si la page n'existe pas, retour automatique au Login
  { path: '**', redirectTo: 'login' }                  
];