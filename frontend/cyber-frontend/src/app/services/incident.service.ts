import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = 'http://localhost:3000/api/incidents';

  constructor(private http: HttpClient) {}

  report(incident: any): Observable<any> {
    return this.http.post(this.apiUrl, incident);
  }

  getMyIncidents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  getAllIncidents(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateIncident(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/summary`);
  }
}
