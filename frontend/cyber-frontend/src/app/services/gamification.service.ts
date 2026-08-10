import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private apiUrl = 'http://localhost:3000/api/gamification';

  constructor(private http: HttpClient) {}

  getMyStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaderboard`);
  }
}
