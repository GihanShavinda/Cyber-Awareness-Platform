import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService } from '../../services/audit.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css'
})
export class AuditLogComponent implements OnInit {
  logs: any[] = [];
  error = '';

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.auditService.getLogs().subscribe({
      next: (data) => (this.logs = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load audit log'),
    });
  }

  // Map action types to a color category
  actionClass(action: string): string {
    if (action.includes('DEACTIVATED') || action.includes('DELETED')) return 'danger';
    if (action.includes('CREATED') || action.includes('ACTIVATED')) return 'success';
    if (action.includes('UPDATED')) return 'info';
    return 'neutral';
  }

  icon(action: string): string {
    if (action.includes('USER')) return '👤';
    if (action.includes('INCIDENT')) return '🚨';
    if (action.includes('CAMPAIGN')) return '🎣';
    return '📝';
  }
}
