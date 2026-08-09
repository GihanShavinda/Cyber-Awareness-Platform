import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { LessonService } from '../../services/lesson.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements OnInit {
  courseId!: number;
  course: any = null;
  lessons: any[] = [];
  error = '';
  canManage = false;

  // form fields
  title = '';
  content = '';
  orderNumber: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private lessonService: LessonService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    const role = this.authService.getUser()?.role;
    this.canManage = ['SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'].includes(role);
    this.loadCourse();
    this.loadLessons();
  }

  loadCourse(): void {
    this.courseService.getCourse(this.courseId).subscribe({
      next: (data) => (this.course = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load course'),
    });
  }

  loadLessons(): void {
    this.lessonService.getLessonsByCourse(this.courseId).subscribe({
      next: (data) => (this.lessons = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load lessons'),
    });
  }

  addLesson(): void {
    if (!this.title) {
      this.error = 'Lesson title is required';
      return;
    }
    const newLesson = {
      title: this.title,
      content: this.content,
      orderNumber: this.orderNumber,
    };
    this.lessonService.createLesson(this.courseId, newLesson).subscribe({
      next: () => {
        this.title = '';
        this.content = '';
        this.orderNumber = null;
        this.error = '';
        this.loadLessons();
      },
      error: (err) => (this.error = err.error?.message || 'Failed to add lesson'),
    });
  }
}
