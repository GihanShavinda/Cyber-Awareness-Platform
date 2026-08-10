import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';
import { authGuard } from './guards/auth.guard';
import { QuizComponent } from './pages/quiz/quiz.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './guards/admin.guard';
import { InboxComponent } from './pages/inbox/inbox.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ReportIncidentComponent } from './pages/report-incident/report-incident.component';
import { IncidentReviewComponent } from './pages/incident-review/incident-review.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'courses', component: CoursesComponent, canActivate: [authGuard] },
  { path: 'courses/:id', component: CourseDetailComponent, canActivate: [authGuard] },
  { path: 'quiz/:id', component: QuizComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: 'inbox', component: InboxComponent, canActivate: [authGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [authGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [authGuard, adminGuard] },
  { path: 'report', component: ReportIncidentComponent, canActivate: [authGuard] },
  { path: 'incidents', component: IncidentReviewComponent, canActivate: [authGuard, adminGuard] },
];
