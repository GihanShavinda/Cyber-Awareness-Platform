import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getOverview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/overview`);
  }

  // Fetch the PDF as a binary blob (token is added by your interceptor)
  downloadUserReport(userId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/user/${userId}`, {
      responseType: 'blob',
    });
  }
}
