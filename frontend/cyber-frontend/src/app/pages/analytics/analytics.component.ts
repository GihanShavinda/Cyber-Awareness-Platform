import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
  loaded = false;
  error = '';

  // Chart styling shared options (dark theme friendly)
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8' } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#24304d' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#24304d' }, beginAtZero: true },
    },
  };

  pieOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8' }, position: 'bottom' } },
  };

  riskData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  categoryData: ChartData<'bar'> = { labels: [], datasets: [] };
  phishingData: ChartData<'bar'> = { labels: [], datasets: [] };
  incidentData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getOverview().subscribe({
      next: (d) => {
        // Risk distribution doughnut
        this.riskData = {
          labels: ['Very Low', 'Low', 'Medium', 'High', 'Critical'],
          datasets: [{
            data: [
              d.riskDistribution.VERY_LOW, d.riskDistribution.LOW,
              d.riskDistribution.MEDIUM, d.riskDistribution.HIGH,
              d.riskDistribution.CRITICAL,
            ],
            backgroundColor: ['#059669', '#22e07a', '#ffb443', '#ff4d6d', '#991b1b'],
          }],
        };

        // Avg score by category bar
        this.categoryData = {
          labels: d.scoresByCategory.map((c: any) => c.category),
          datasets: [{
            label: 'Avg Score %',
            data: d.scoresByCategory.map((c: any) => c.averageScore),
            backgroundColor: '#00e5c7',
          }],
        };

        // Phishing behavior bar
        this.phishingData = {
          labels: ['Opened', 'Clicked', 'Reported'],
          datasets: [{
            label: 'Events',
            data: [d.phishing.opened, d.phishing.clicked, d.phishing.reported],
            backgroundColor: ['#a855f7', '#ff4d6d', '#22e07a'],
          }],
        };

        // Incident status doughnut
        this.incidentData = {
          labels: ['Open', 'Reviewing', 'Resolved', 'Dismissed'],
          datasets: [{
            data: [
              d.incidentStatus.open, d.incidentStatus.reviewing,
              d.incidentStatus.resolved, d.incidentStatus.dismissed,
            ],
            backgroundColor: ['#ffb443', '#00e5c7', '#22e07a', '#5b6b84'],
          }],
        };

        this.loaded = true;
      },
      error: (err) => (this.error = err.error?.message || 'Failed to load analytics'),
    });
  }
}
