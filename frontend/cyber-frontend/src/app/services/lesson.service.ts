import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = 'http://localhost:3000/api/lessons';

  constructor(private http: HttpClient) {}

  getLessonsByCourse(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/course/${courseId}`);
  }

  createLesson(courseId: number, lesson: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/course/${courseId}`, lesson);
  }
}
