import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ URLs corrigées pour correspondre au backend
  getMyDemandes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/profile/di`);
  }

  getMyOrdres(): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiUrl}/profile/ordres`);
}

  // ✅ GET profil
  getMe(): Observable<any> {
    return this.http.get<any>(`${this.api}/profile`);
  }

  updateProfile(payload: any): Observable<any> {
    return this.http.put<any>(`${this.api}/profile`, payload);
  }
}