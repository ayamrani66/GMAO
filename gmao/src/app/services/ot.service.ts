import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class OtService {

  private api = environment.apiUrl + '/ot';
  private apiUrl1 = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }
getNewOtCorrectifCount(userId: number): Observable<number> {
  return this.http.get<number>(`${this.apiUrl1}/notifications/count-unread/ot-correctif`, {
    params: { userId: userId.toString() }
  });
}

getNewOtPreventifCount(userId: number): Observable<number> {
  return this.http.get<number>(`${this.apiUrl1}/notifications/count-unread/ot-preventif`, {
    params: { userId: userId.toString() }
  });
}

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  create(ot: any): Observable<any> {
    return this.http.post(this.api, ot);
  }

  updateStatut(id: number, statut: string): Observable<any> {
    return this.http.put(`${this.api}/${id}/statut`, { statut });
  }

  saveCompteRendu(id: number, compteRendu: string): Observable<any> {
  return this.http.put(`${this.api}/${id}/compte-rendu`, { compteRendu });
}

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  getPdf(id: number): string {
    return `${this.api}/${id}/pdf`;
  }

  savePdr(otId: number, pieceRechangeId: number | null, quantiteConsommee: number | null): Observable<any> {
  return this.http.patch<any>(`${environment.apiUrl}/ot/${otId}/pdr`, { pieceRechangeId, quantiteConsommee });
}
getAllPreventifs(): Observable<any[]> {
  return this.http.get<any[]>(`${this.api}/preventifs`);
}

getAllCorrectifs(): Observable<any[]> {
  return this.http.get<any[]>(`${this.api}/correctifs`);
}
update(id: number, ot: any): Observable<any> {
  return this.http.put(`${this.api}/${id}`, ot);
}
saveFeedback(id: number, feedback: any): Observable<any> {
  return this.http.patch<any>(`${this.api}/${id}/feedback`, feedback);
}
getChecklist(otId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.api}/${otId}/checklist`);
}

toggleOperation(otId: number, operationId: number, estFaite: boolean): Observable<any> {
  return this.http.patch<any>(`${this.api}/${otId}/operations/${operationId}/checklist`, { estFaite });
}
toggleActionOT(otId: number, actionId: number, estFaite: boolean): Observable<any> {
  return this.http.patch<any>(
    `${this.api}/${otId}/actions/${actionId}/toggle`,
    { estFaite }
  );
}
getByDiId(diId: number): Observable<any> {
  return this.http.get<any>(`${this.api}/by-di/${diId}`);
}
}