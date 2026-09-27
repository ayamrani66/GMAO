import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AlerteStock {
  designation: string;
  quantiteStock: number;
  seuilMinimal: number;
  statut: 'RUPTURE' | 'CRITIQUE';
}

export interface MaintenanceRetard {
  titre: string;
  typeOT: string;
  datePrevue: string;
  joursRetard: number;
}

export interface MaintenanceAVenir {
  date: string;
  numeroOT: number;
  titre: string;
}

export interface OtTermine {
  equipementNom: string;
  typeOT: string;
  heureTerminaison: string;
  technicien: string;
}

export interface DashboardStats {
  totalEquipements: number;
  interventionsEnCours: number;
  interventionsTermineesMois: number;
  preventifsPlanifies: number;
  demandesOuvertes: number;
  valeurTotalStock: number;

  tauxRealisation: number;
  tauxRealisationCorrectif: number;
  tauxRealisationPreventif: number;

  interventionsParMois: number[];

  totalCorrectif: number;
  totalPreventif: number;

  equipementLabels: string[];
  coutParEquipement: number[];

  totalRefs: number;
  piecesEnRupture: number;
  piecesSousSeuil: number;

  alertesStock: AlerteStock[];
  maintenancesEnRetard: MaintenanceRetard[];
  maintenancesAVenir: MaintenanceAVenir[];
  otTerminesAujourdhui: OtTermine[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiUrl = `${environment.apiUrl}/dashboard/stats`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl);
  }
}