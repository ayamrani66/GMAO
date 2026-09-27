// ================================================================
// prediction.service.ts
// ================================================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationPrediction {
  id: number;
  zone: string;
  operation: string;
  typeArret: string;
  horizonH: number;
  probabilite: number;
  dureeEstimeeMin: number;
  raisonProbable: string;
  niveauRisque: 'CRITIQUE' | 'MODÉRÉ' | 'FAIBLE';
  message: string;
  heurePrediction: string;
  lue: boolean;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly BASE = '/api/predictions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<NotificationPrediction[]> {
    return this.http.get<NotificationPrediction[]>(this.BASE);
  }

  getNonLues(): Observable<NotificationPrediction[]> {
    return this.http.get<NotificationPrediction[]>(`${this.BASE}/non-lues`);
  }

  getCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.BASE}/count`);
  }

  marquerLue(id: number): Observable<NotificationPrediction> {
    return this.http.patch<NotificationPrediction>(`${this.BASE}/${id}/lire`, {});
  }

  lireTout(): Observable<void> {
    return this.http.patch<void>(`${this.BASE}/lire-tout`, {});
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}