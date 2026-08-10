import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = 'http://localhost:3000/api/audit';

  constructor(private http: HttpClient) {}

  getLogs(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
