import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from '../../services/user-management.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  error = '';
  success = '';
  currentUserId: number | null = null;

  roles = ['SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER', 'MANAGER', 'EMPLOYEE'];

  // create form
  newName = '';
  newEmail = '';
  newPassword = '';
  newRole = 'EMPLOYEE';

  constructor(
    private userService: UserManagementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUser()?.id ?? null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load users'),
    });
  }

  createUser(): void {
    this.error = '';
    this.success = '';
    if (!this.newName || !this.newEmail || !this.newPassword) {
      this.error = 'Name, email and password are required';
      return;
    }
    this.userService.createUser({
      name: this.newName,
      email: this.newEmail,
      password: this.newPassword,
      role: this.newRole,
    }).subscribe({
      next: () => {
        this.success = 'User created successfully';
        this.newName = '';
        this.newEmail = '';
        this.newPassword = '';
        this.newRole = 'EMPLOYEE';
        this.loadUsers();
      },
      error: (err) => (this.error = err.error?.message || 'Failed to create user'),
    });
  }

  changeRole(user: any, role: string): void {
    this.userService.updateUser(user.id, { role }).subscribe({
      next: () => {
        this.success = `${user.name}'s role updated to ${role}`;
        this.loadUsers();
      },
      error: (err) => (this.error = err.error?.message || 'Failed to update role'),
    });
  }

  toggleStatus(user: any): void {
    this.error = '';
    this.success = '';
    const action = user.status === 'active'
      ? this.userService.deactivate(user.id)
      : this.userService.activate(user.id);

    action.subscribe({
      next: () => {
        this.success = `${user.name} is now ${user.status === 'active' ? 'inactive' : 'active'}`;
        this.loadUsers();
      },
      error: (err) => (this.error = err.error?.message || 'Failed to change status'),
    });
  }
}
