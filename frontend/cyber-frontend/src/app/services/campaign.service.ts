import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = 'http://localhost:3000/api/campaigns';

  constructor(private http: HttpClient) {}

  getInbox(): Observable<any> {
    return this.http.get(`${this.apiUrl}/inbox/me`);
  }

  respond(campaignId: number, action: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${campaignId}/respond`, { action });
  }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  create(campaign: any): Observable<any> {
    return this.http.post(this.apiUrl, campaign);
  }

  schedule(id: number, minutesFromNow: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/schedule`, { minutesFromNow });
  }
}
