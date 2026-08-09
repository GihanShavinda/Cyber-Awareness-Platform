import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:3000/api/progress';

  constructor(private http: HttpClient) {}

  getMyProgress(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }
}
