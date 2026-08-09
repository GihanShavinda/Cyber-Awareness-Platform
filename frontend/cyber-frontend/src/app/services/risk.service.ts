import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private apiUrl = 'http://localhost:3000/api/risk';

  constructor(private http: HttpClient) {}

  getMyRisk(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }
}
