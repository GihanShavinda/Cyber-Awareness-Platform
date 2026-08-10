import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentService } from '../../services/incident.service';

@Component({
  selector: 'app-report-incident',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-incident.component.html',
  styleUrl: './report-incident.component.css'
})
export class ReportIncidentComponent implements OnInit {
  myIncidents: any[] = [];
  error = '';
  success = '';

  types = ['phishing', 'malware', 'suspicious_email', 'other'];
  severities = ['low', 'medium', 'high', 'critical'];

  title = '';
  description = '';
  type = 'phishing';
  severity = 'medium';

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.loadMine();
  }

  loadMine(): void {
    this.incidentService.getMyIncidents().subscribe({
      next: (data) => (this.myIncidents = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load your reports'),
    });
  }

  submit(): void {
    this.error = '';
    this.success = '';
    if (!this.title || !this.description) {
      this.error = 'Title and description are required';
      return;
    }
    this.incidentService.report({
      title: this.title,
      description: this.description,
      type: this.type,
      severity: this.severity,
    }).subscribe({
      next: () => {
        this.success = 'Incident reported. Thank you — your security team will review it.';
        this.title = '';
        this.description = '';
        this.type = 'phishing';
        this.severity = 'medium';
        this.loadMine();
      },
      error: (err) => (this.error = err.error?.message || 'Failed to report incident'),
    });
  }
}
