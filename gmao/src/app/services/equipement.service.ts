import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Equipement } from '../models/equipement.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquipementService {

  private apiUrl = environment.apiUrl + '/equipements';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Equipement[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<Equipement>(`${this.apiUrl}/${id}`);
  }
  
  create(equipement: Equipement) {
  return this.http.post<Equipement>(this.apiUrl, equipement);
}

  update(equipement: Equipement): Observable<Equipement> {
    return this.http.put<Equipement>(`${this.apiUrl}/${equipement.id}`, equipement);
  }

  getArchived(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(`${this.apiUrl}/archived`);
  }
  getHistorique(id: number): Observable<{ ots: any[], coutTotal: number }> {
  return this.http.get<{ ots: any[], coutTotal: number }>(`${this.apiUrl}/${id}/historique`);
}
}
