import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private api = environment.apiUrl + '/documents';

  constructor(private http: HttpClient) {}

  upload(file: File, params: { equipementId?: number, diId?: number, otId?: number }): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (params.equipementId) formData.append('equipementId', String(params.equipementId));
    if (params.diId)         formData.append('diId',         String(params.diId));
    if (params.otId)         formData.append('otId',         String(params.otId));
    return this.http.post(this.api, formData);
  }

  getByDi(diId: number):               Observable<any[]> { return this.http.get<any[]>(`${this.api}/di/${diId}`); }
  getByOt(otId: number):               Observable<any[]> { return this.http.get<any[]>(`${this.api}/ot/${otId}`); }
  getByEquipement(id: number):         Observable<any[]> { return this.http.get<any[]>(`${this.api}/equipement/${id}`); }
  delete(id: number):                  Observable<void>  { return this.http.delete<void>(`${this.api}/${id}`); }

  // ✅ inline → pour afficher dans <img> et lightbox
  getViewUrl(id: number): string {
    return `${this.api}/${id}/file`;
  }

  // ✅ attachment → pour forcer le téléchargement PDF
  getDownloadUrl(nomFichier: string): string {
    return `${this.api}/download/${nomFichier}`;
  }
}