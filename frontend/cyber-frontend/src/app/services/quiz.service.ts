import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:3000/api/quizzes';

  constructor(private http: HttpClient) {}

  getQuizzesByCourse(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/course/${courseId}`);
  }

  getQuiz(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  submitQuiz(id: number, answers: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/submit`, { answers });
  }
}
