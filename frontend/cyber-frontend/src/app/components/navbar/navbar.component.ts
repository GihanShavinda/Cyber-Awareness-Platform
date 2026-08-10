import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  user: any;
  isAdmin = false;
  adminMenuOpen = false;

  notifications: any[] = [];
  unreadCount = 0;
  bellOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.user = this.authService.getUser();
    this.isAdmin = ['SUPER_ADMIN', 'ORG_ADMIN'].includes(this.user?.role);
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getMine().subscribe({
      next: (data) => {
        this.notifications = data.notifications;
        this.unreadCount = data.unreadCount;
      },
      error: () => {},
    });
  }

  toggleBell(): void {
    this.bellOpen = !this.bellOpen;
    this.adminMenuOpen = false;
  }

  onNotificationClick(n: any): void {
    if (!n.isRead) {
      this.notificationService.markRead(n.id).subscribe({
        next: () => {
          n.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
      });
    }
    if (n.link) {
      this.bellOpen = false;
      this.router.navigate([n.link]);
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.isRead = true));
        this.unreadCount = 0;
      },
    });
  }

  toggleAdminMenu(): void {
    this.adminMenuOpen = !this.adminMenuOpen;
    this.bellOpen = false;
  }

  closeAdminMenu(): void {
    this.adminMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
