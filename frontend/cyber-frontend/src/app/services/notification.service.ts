import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api/notifications';

  constructor(private http: HttpClient) {}

  getMine(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  markRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {});
  }
}
