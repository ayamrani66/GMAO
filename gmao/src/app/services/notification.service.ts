import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = environment.apiUrl + '/notifications';

  unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  // ← userId doit être un number, pas un objet
  getAll(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/user/${userId}`);
  }

  countUnread(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.api}/user/${userId}/count`);
  }

  markAllAsRead(userId: number): Observable<any> {
    return this.http.patch(`${this.api}/user/${userId}/lue-tout`, {});
  }

  markAsRead(notifId: number): Observable<any> {
    return this.http.patch(`${this.api}/${notifId}/lue`, {});
  }
  refreshUnreadCount(userId: number): void {
    this.countUnread(userId).subscribe(res => {
      this.unreadCount$.next(res.count);
    });
  }
}