import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProgressService } from '../../services/progress.service';
import { RiskService } from '../../services/risk.service';
import { GamificationService } from '../../services/gamification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: any;
  progress: any[] = [];
  averageScore = 0;
  completedCount = 0;
  passedCount = 0;
  risk: any = null;
  gameStats: any = null;

  constructor(
    private authService: AuthService,
    private progressService: ProgressService,
    private riskService: RiskService,
    private gamificationService: GamificationService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    this.progressService.getMyProgress().subscribe({
      next: (data) => {
        this.progress = data;
        this.completedCount = data.length;
        this.passedCount = data.filter((p: any) => p.passed).length;
        if (data.length > 0) {
          const total = data.reduce((sum: number, p: any) => sum + (p.score || 0), 0);
          this.averageScore = Math.round(total / data.length);
        }
      },
      error: () => {},
    });

    this.riskService.getMyRisk().subscribe({
      next: (data) => (this.risk = data),
      error: () => {},
    });

    this.gamificationService.getMyStats().subscribe({
      next: (data) => (this.gameStats = data),
      error: () => {},
    });
  }

  formatRiskLevel(level: string): string {
    if (!level) return '';
    return level.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
