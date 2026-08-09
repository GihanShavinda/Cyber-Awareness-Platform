import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  error = '';

  // form fields
  title = '';
  description = '';
  category = '';
  difficulty = 'beginner';
  duration: number | null = null;

  canManage = false;

  constructor(
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    const role = user?.role;
    this.canManage = ['SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'].includes(role);
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (data) => (this.courses = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load courses'),
    });
  }

  createCourse(): void {
    if (!this.title) {
      this.error = 'Title is required';
      return;
    }
    const newCourse = {
      title: this.title,
      description: this.description,
      category: this.category,
      difficulty: this.difficulty,
      duration: this.duration,
    };
    this.courseService.createCourse(newCourse).subscribe({
      next: () => {
        this.title = '';
        this.description = '';
        this.category = '';
        this.duration = null;
        this.error = '';
        this.loadCourses();
      },
      error: (err) => (this.error = err.error?.message || 'Failed to create course'),
    });
  }
}
