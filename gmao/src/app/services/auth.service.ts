import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
  const userId = localStorage.getItem('userId');
  const token  = localStorage.getItem('token');
}

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.api}/register`, user);
  }

  checkMailExists(mail: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.api}/check-mail`, { params: { mail } });
  }

login(credentials: any): Observable<any> {
  return this.http.post(`${this.api}/login`, credentials).pipe(
    tap((res: any) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('mail', res.mail);
      localStorage.setItem('role', res.role);
      localStorage.setItem('nomComplet', res.nomComplet);
      localStorage.setItem('userId', res.id?.toString() ?? '');
      localStorage.setItem('roleTechnicien', res.roleTechnicien ?? ''); // ← AJOUTER
    })
  );
}

getCurrentUser(): any {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    id:              Number(localStorage.getItem('userId')),
    mail:            localStorage.getItem('mail'),
    role:            localStorage.getItem('role'),
    nomComplet:      localStorage.getItem('nomComplet'),
    roleTechnicien:  localStorage.getItem('roleTechnicien') || null, // ← AJOUTER
  };
}

  logout(): void {
    localStorage.clear();
  }
}