import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface UserDTO {
  id: number;
  mail: string;
  nomComplet: string;
  telephone: string;
  role: string;
  createdAt?: string;
    roleTechnicien?: string | null
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = environment.apiUrl + '/users';
  
  constructor(private http: HttpClient) { }
  
getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.api);
  }
getPendingUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.api}/pending`);
  }

assignRole(userId: number, role: string, roleTechnicien?: string | null): Observable<UserDTO> {
  return this.http.put<UserDTO>(`${this.api}/${userId}/role`, { 
    role, 
    roleTechnicien: roleTechnicien ?? null 
  });
}
}
