import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { PredictionService } from '../../services/prediction.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  summary: any = null;
  users: any[] = [];
  predictions: any[] = [];
  mlAvailable = true;
  error = '';

  constructor(
    private adminService: AdminService,
    private predictionService: PredictionService
  ) {}

  ngOnInit(): void {
    this.adminService.getOverview().subscribe({
      next: (data) => {
        this.summary = data.summary;
        this.users = data.users;
      },
      error: (err) => (this.error = err.error?.message || 'Failed to load admin data'),
    });

    this.predictionService.getAllPredictions().subscribe({
      next: (data) => (this.predictions = data),
      error: () => (this.mlAvailable = false),
    });
  }

  formatRiskLevel(level: string): string {
    if (!level) return '';
    return level.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
