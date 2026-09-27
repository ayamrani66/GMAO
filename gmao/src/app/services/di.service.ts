import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DiService {

  private api = environment.apiUrl + '/di';
  private apiUrl1 = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  getById(id: number): Observable<any> {
  return this.http.get<any>(`${this.api}/${id}`);
}
getNewDiCount(userId: number): Observable<number> {
  return this.http.get<number>(`${this.apiUrl1}/notifications/count-unread/di`, {
    params: { userId: userId.toString() }
  });
}

  create(di: any): Observable<any> {
    return this.http.post<any>(this.api, di);
  }

  update(id: number, di: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, di);
  }

  valider(id: number, affectationTechnicien: string, titreOT: string): Observable<any> {
  return this.http.put(`${this.api}/${id}/valider`, { affectationTechnicien, titreOT });
}

rejeter(id: number, cause: string): Observable<any> {
  return this.http.put(`${this.api}/${id}/rejeter`, { cause });
}

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}