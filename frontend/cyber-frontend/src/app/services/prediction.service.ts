import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = 'http://localhost:3000/api/prediction';

  constructor(private http: HttpClient) {}

  getAllPredictions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }
}
