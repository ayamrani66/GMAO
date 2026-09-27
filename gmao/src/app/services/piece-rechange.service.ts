
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PieceRechange } from '../models/piece-rechange.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PieceRechangeService {

  private baseUrl = environment.apiUrl +'/pieces-rechange';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PieceRechange[]> {
    return this.http.get<PieceRechange[]>(this.baseUrl);
  }

  getById(id: number): Observable<PieceRechange> {
    return this.http.get<PieceRechange>(`${this.baseUrl}/${id}`);
  }

  getEnAlerte(): Observable<PieceRechange[]> {
    return this.http.get<PieceRechange[]>(`${this.baseUrl}/alerte`);
  }

  existsByCode(code: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/exists/${code}`);
  }

  create(pdr: PieceRechange): Observable<PieceRechange> {
    return this.http.post<PieceRechange>(this.baseUrl, pdr);
  }

  update(id: number, pdr: PieceRechange): Observable<PieceRechange> {
    return this.http.put<PieceRechange>(`${this.baseUrl}/${id}`, pdr);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}